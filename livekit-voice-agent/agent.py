# # from dotenv import load_dotenv

# # from livekit import agents, rtc
# # from livekit.agents import AgentServer, AgentSession, Agent, room_io
# # from livekit.plugins import (
# #     openai,
# #     noise_cancellation,
# # )

# # load_dotenv(".env.local")

# # class Assistant(Agent):
# #     def __init__(self) -> None:
# #         super().__init__(instructions="You are a helpful voice AI assistant.")

# # server = AgentServer()

# # @server.rtc_session(agent_name="my-agent")
# # async def my_agent(ctx: agents.JobContext):
# #     session = AgentSession(
# #         llm=openai.realtime.RealtimeModel(
# #             voice="coral"
# #         )
# #     )

# #     await session.start(
# #         room=ctx.room,
# #         agent=Assistant(),
# #         room_options=room_io.RoomOptions(
# #             audio_input=room_io.AudioInputOptions(
# #                 noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
# #             ),
# #         ),
# #     )

# #     await session.generate_reply(
# #         instructions="Greet the user and offer your assistance. You should start by speaking in English."
# #     )


# # if __name__ == "__main__":
# #     agents.cli.run_app(server)


# import aiohttp
# from datetime import datetime, timedelta
# from dotenv import load_dotenv
# from livekit import agents, rtc
# from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
# from livekit.plugins import (
#     openai,
#     noise_cancellation,
# )

# load_dotenv(".env.local")

# NEXT_APP_URL = "http://localhost:3000"


# class Assistant(Agent):
#     def __init__(self) -> None:
#         super().__init__(instructions="""You are a helpful AI receptionist for a medical clinic.
# When a patient wants to book an appointment:
# 1. Ask for their name and phone number if not given
# 2. Call check_availability to find open slots for the requested date
# 3. Read out 2-3 options using only the "label" field
# 4. Once the patient picks a slot, use the exact "time" field (ISO string) as start_time when calling book_appointment — never modify or reconstruct this value
# 5. Ask for their email address
# 6. Call book_appointment with all details
# 7. Confirm the booking to the patient

# IMPORTANT: When booking, always use the exact ISO time string returned by check_availability. Never guess or reconstruct the time.
# Keep responses short and natural since this is a voice conversation.
# Always respond in English.""")

#     @function_tool()
#     async def check_availability(self, date: str) -> str:
#         """Check available appointment slots for a given date.
#         Returns slots with both a human-readable label AND the exact ISO time to use for booking.
#         Args:
#             date: Date in YYYY-MM-DD format (e.g. "2026-03-10")
#         """
#         try:
#             dt = datetime.strptime(date.strip(), "%Y-%m-%d")
#             date_to = (dt + timedelta(days=2)).strftime("%Y-%m-%d")

#             async with aiohttp.ClientSession() as session:
#                 async with session.get(
#                     f"{NEXT_APP_URL}/api/ai/book?dateFrom={date}&dateTo={date_to}"
#                 ) as res:
#                     data = await res.json()

#             slots = data.get("slots", [])
#             if not slots:
#                 return f"No available slots found around {date}. Try different dates."

#             # Return both label (to read to patient) and time (to use for booking)
#             lines = [f"- {slot['label']} [ISO: {slot['time']}]" for slot in slots[:6]]
#             return "Available slots (use the ISO time exactly when booking):\n" + "\n".join(lines)
#         except Exception as e:
#             return f"Could not check availability: {str(e)}"

#     @function_tool()
#     async def book_appointment(
#         self,
#         patient_name: str,
#         patient_phone: str,
#         patient_email: str,
#         doctor_name: str,
#         start_time: str,
#         notes: str = "",
#     ) -> str:
#         """Book an appointment for a patient.
#         Args:
#             patient_name: Full name of the patient
#             patient_phone: Patient's phone number
#             patient_email: Patient's email address
#             doctor_name: Name of the doctor (e.g. "Dr. Sharma")
#             start_time: Exact ISO time string from check_availability (e.g. "2026-03-10T04:30:00.000Z")
#             notes: Optional reason for visit
#         """
#         try:
#             async with aiohttp.ClientSession() as session:
#                 async with session.post(
#                     f"{NEXT_APP_URL}/api/ai/book",
#                     json={
#                         "patientName": patient_name,
#                         "patientPhone": patient_phone,
#                         "patientEmail": patient_email,
#                         "doctorName": doctor_name,
#                         "startTime": start_time,
#                         "notes": notes,
#                         "bookedBy": "ai",
#                     },
#                 ) as res:
#                     data = await res.json()

#             if res.status != 201:
#                 return f"Booking failed: {data.get('error', 'Unknown error')}"

#             return data.get("message", f"Appointment booked for {patient_name}. Confirmation sent.")
#         except Exception as e:
#             return f"Could not complete booking: {str(e)}"


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
    # openai,
    google,
    noise_cancellation,
)
import os

load_dotenv(".env.local")

NEXT_APP_URL = os.getenv("NEXT_APP_URL", "http://localhost:3000")


async def fetch_clinic_settings() -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{NEXT_APP_URL}/api/settings") as res:
                if res.status == 200:
                    return await res.json()
    except Exception as e:
        print(f"[agent] Failed to fetch settings: {e}")
    return {
        "clinicName": "Sharma Clinic",
        "doctorName": "Dr. Sharma",
        "clinicPhone": "+91 98765 43210",
        "clinicAddress": "123 MG Road, Pune",
        "greetingMessage": "Hello! Thank you for calling Sharma Clinic. How can I help you today?",
        "responseTone": "friendly",
        "language": "English",
        "fallbackResponse": "I'm sorry, I wasn't able to help with that. Please call back during clinic hours.",
        "appointmentDuration": 30,
        "maxAdvanceBookingDays": 14,
        "hours": {str(i): {"enabled": i != 0, "open": "09:00", "close": "19:00"} for i in range(7)},
        "escalationRules": [],
    }


def build_system_prompt(cfg: dict) -> str:
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    hours_lines = []
    for i, day in enumerate(days):
        h = cfg.get("hours", {}).get(str(i), {})
        if h.get("enabled"):
            hours_lines.append(f"  {day}: {h['open']} - {h['close']}")
        else:
            hours_lines.append(f"  {day}: Closed")
    hours_str = "\n".join(hours_lines)

    tone_map = {
        "friendly": "warm, conversational, and empathetic",
        "neutral": "balanced, clear, and professional",
        "formal": "formal, precise, and clinical",
    }
    tone = tone_map.get(cfg.get("responseTone", "friendly"), "warm and friendly")

    rules = cfg.get("escalationRules", [])
    rules_str = ""
    if rules:
        rules_str = "\n\nESCALATION RULES — follow these exactly:\n" + "\n".join(
            f"- IF {r['trigger']}: {r['action']}"
            for r in rules
            if r.get("trigger") and r.get("action")
        )

    return f"""You are Receptra, the AI voice receptionist for {cfg['clinicName']}.

CRITICAL RULES:
- This is a VOICE call. Keep every response under 2-3 sentences. Never list more than 3 options at once.
- Never introduce yourself unless it's the very first message.
- Never say "Sure", "Of course", "Certainly", "Absolutely", or "Great" — get straight to the point.
- Do not ask multiple questions at once. One question per turn.
- Speak in {cfg.get('language', 'English')} only. Do not switch languages even if the patient does.
- Be {tone}.

CLINIC INFORMATION:
- Clinic: {cfg['clinicName']}
- Doctor: {cfg['doctorName']}
- Address: {cfg['clinicAddress']}
- Phone: {cfg['clinicPhone']}

CLINIC HOURS:
{hours_str}

APPOINTMENT BOOKING FLOW — follow this exact order:
1. Ask for the patient's preferred date
2. Call check_availability for that date
3. Read out up to 3 available slots by time only (e.g. "10 AM, 11:30 AM, or 2 PM")
4. Patient picks a slot
5. Ask for their full name
6. Ask for their phone number
7. Ask for their email address
8. Call book_appointment with the exact ISO time from check_availability — never reconstruct the time
9. Confirm: "Done! Appointment confirmed for [date and time] with {cfg['doctorName']}."

BOOKING RULES:
- Duration: {cfg.get('appointmentDuration', 30)} minutes per slot
- Max advance: {cfg.get('maxAdvanceBookingDays', 14)} days
- Always use the exact ISO string returned by check_availability as start_time

FALLBACK:
If you cannot help with something, say: "{cfg.get('fallbackResponse', 'Please call us back during clinic hours.')}"
{rules_str}"""


class Assistant(Agent):
    def __init__(self, system_prompt: str) -> None:
        super().__init__(instructions=system_prompt)

    @function_tool()
    async def check_availability(self, date: str) -> str:
        """Check available appointment slots for a given date.
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
            start_time: Exact ISO time string from check_availability — do not modify this value
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

            return data.get("message", f"Appointment booked for {patient_name}.")
        except Exception as e:
            return f"Could not complete booking: {str(e)}"


server = AgentServer()


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: agents.JobContext):
    cfg = await fetch_clinic_settings()
    system_prompt = build_system_prompt(cfg)
    greeting = cfg.get("greetingMessage", "Hello! Thank you for calling. How can I help you today?")

    print(f"[agent] Session starting — clinic: {cfg.get('clinicName')}, tone: {cfg.get('responseTone')}")

    session = AgentSession(
        # llm=openai.realtime.RealtimeModel(voice="coral")
        llm=google.realtime.RealtimeModel(voice="Puck")
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(system_prompt=system_prompt),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions=f"Say exactly this as your opening message, word for word: \"{greeting}\""
    )


if __name__ == "__main__":
    agents.cli.run_app(server)