# from dotenv import load_dotenv

# from livekit import agents, rtc
# from livekit.agents import AgentServer, AgentSession, Agent, room_io
# from livekit.plugins import (
#     openai,
#     noise_cancellation,
# )

# load_dotenv(".env.local")

# class Assistant(Agent):
#     def __init__(self) -> None:
#         super().__init__(instructions="You are a helpful voice AI assistant.")

# server = AgentServer()

# @server.rtc_session(agent_name="my-agent")
# async def my_agent(ctx: agents.JobContext):
#     session = AgentSession(
#         llm=openai.realtime.RealtimeModel(
#             voice="coral"
#         )
#     )

#     await session.start(
#         room=ctx.room,
#         agent=Assistant(),
#         room_options=room_io.RoomOptions(
#             audio_input=room_io.AudioInputOptions(
#                 noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
#             ),
#         ),
#     )

#     await session.generate_reply(
#         instructions="Greet the user and offer your assistance. You should start by speaking in English."
#     )


# if __name__ == "__main__":
#     agents.cli.run_app(server)


import aiohttp
from datetime import datetime, timedelta
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
from livekit.plugins import (
    openai,
    noise_cancellation,
)

load_dotenv(".env.local")

NEXT_APP_URL = "http://localhost:3000"


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="""You are a helpful AI receptionist for a medical clinic.
When a patient wants to book an appointment:
1. Ask for their name and phone number if not given
2. Call check_availability to find open slots for the requested date
3. Read out 2-3 options using only the "label" field
4. Once the patient picks a slot, use the exact "time" field (ISO string) as start_time when calling book_appointment — never modify or reconstruct this value
5. Ask for their email address
6. Call book_appointment with all details
7. Confirm the booking to the patient

IMPORTANT: When booking, always use the exact ISO time string returned by check_availability. Never guess or reconstruct the time.
Keep responses short and natural since this is a voice conversation.
Always respond in English.""")

    @function_tool()
    async def check_availability(self, date: str) -> str:
        """Check available appointment slots for a given date.
        Returns slots with both a human-readable label AND the exact ISO time to use for booking.
        Args:
            date: Date in YYYY-MM-DD format (e.g. "2026-03-10")
        """
        try:
            dt = datetime.strptime(date.strip(), "%Y-%m-%d")
            date_to = (dt + timedelta(days=2)).strftime("%Y-%m-%d")

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{NEXT_APP_URL}/api/ai/book?dateFrom={date}&dateTo={date_to}"
                ) as res:
                    data = await res.json()

            slots = data.get("slots", [])
            if not slots:
                return f"No available slots found around {date}. Try different dates."

            # Return both label (to read to patient) and time (to use for booking)
            lines = [f"- {slot['label']} [ISO: {slot['time']}]" for slot in slots[:6]]
            return "Available slots (use the ISO time exactly when booking):\n" + "\n".join(lines)
        except Exception as e:
            return f"Could not check availability: {str(e)}"

    @function_tool()
    async def book_appointment(
        self,
        patient_name: str,
        patient_phone: str,
        patient_email: str,
        doctor_name: str,
        start_time: str,
        notes: str = "",
    ) -> str:
        """Book an appointment for a patient.
        Args:
            patient_name: Full name of the patient
            patient_phone: Patient's phone number
            patient_email: Patient's email address
            doctor_name: Name of the doctor (e.g. "Dr. Sharma")
            start_time: Exact ISO time string from check_availability (e.g. "2026-03-10T04:30:00.000Z")
            notes: Optional reason for visit
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{NEXT_APP_URL}/api/ai/book",
                    json={
                        "patientName": patient_name,
                        "patientPhone": patient_phone,
                        "patientEmail": patient_email,
                        "doctorName": doctor_name,
                        "startTime": start_time,
                        "notes": notes,
                        "bookedBy": "ai",
                    },
                ) as res:
                    data = await res.json()

            if res.status != 201:
                return f"Booking failed: {data.get('error', 'Unknown error')}"

            return data.get("message", f"Appointment booked for {patient_name}. Confirmation sent.")
        except Exception as e:
            return f"Could not complete booking: {str(e)}"


server = AgentServer()


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="coral"
        )
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance. You should start by speaking in English."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)