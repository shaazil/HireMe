"""
AI-powered contextual interview question generation.
Produces personalized, non-repetitive questions from resume, role, and conversation history.
"""

import logging
from typing import Any

from ai import provider

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """You are an experienced technical recruiter conducting a live interview.
Your tone is warm, professional, and conversational — like a real hiring manager, not a quiz bot.

Core rules:
- Ask exactly ONE question at a time
- Sound human: use natural phrasing, occasional brief transitions ("That's helpful —", "Building on that —")
- Reference specific projects, technologies, and experiences from the candidate's resume when available
- Probe deeper on vague answers; ask clarifying follow-ups tied to what they just said
- Never repeat a topic, project, or question already covered in this session
- Avoid textbook definitions ("What is React?", "Explain OOPs", "What are Python lists?")
- Mix behavioral, technical, project-deep-dive, and situational questions naturally
- Progressively increase technical depth when answers are strong; simplify when answers are weak
- Align every question with the role being interviewed for

Categories (use exactly one per question):
- behavioral — teamwork, leadership, conflict, growth
- technical — architecture, tools, trade-offs, implementation details
- project — deep dive on a specific resume project
- problem_solving — debugging, constraints, prioritization
- communication — explaining concepts, stakeholder alignment

Output ONLY valid JSON matching the requested schema. No markdown fences."""

ROLE_FOCUS = {
    "frontend": (
        "Focus on: React/component architecture, state management, UI performance, "
        "API integration, accessibility, and real frontend project decisions."
    ),
    "backend": (
        "Focus on: API design, authentication, databases, caching, scalability, "
        "error handling, and production backend trade-offs."
    ),
    "full stack": (
        "Focus on: frontend-backend integration, deployment, database design, "
        "auth flows, and end-to-end system ownership."
    ),
    "fullstack": (
        "Focus on: frontend-backend integration, deployment, database design, "
        "auth flows, and end-to-end system ownership."
    ),
    "ai": (
        "Focus on: model selection, datasets, evaluation metrics, training pipelines, "
        "deployment, and ML project trade-offs from their resume."
    ),
    "ml": (
        "Focus on: model selection, datasets, evaluation metrics, training pipelines, "
        "deployment, and ML project trade-offs from their resume."
    ),
    "data": (
        "Focus on: data pipelines, feature engineering, model evaluation, "
        "and production ML/data system decisions."
    ),
}


def _role_focus(role: str) -> str:
    role_lower = role.lower()
    for key, focus in ROLE_FOCUS.items():
        if key in role_lower:
            return focus
    return (
        "Focus on practical engineering: system design, code quality, "
        "collaboration, and role-relevant technical depth."
    )


def _experience_label(years: int | None) -> str:
    if years is None:
        return "mid-level (experience not specified)"
    if years <= 2:
        return "junior (0–2 years)"
    if years <= 5:
        return "mid-level (3–5 years)"
    return "senior (6+ years)"


def _format_context(ctx: dict[str, Any]) -> str:
    """Build the context block injected into every generation prompt."""
    parts = [
        f"Candidate: {ctx['candidate_name']}",
        f"Role applied: {ctx['role']}",
        f"Experience level: {_experience_label(ctx.get('experience_years'))}",
        f"Role focus: {_role_focus(ctx['role'])}",
    ]
    if ctx.get("company_name"):
        parts.append(f"Company: {ctx['company_name']}")
    if ctx.get("job_title"):
        parts.append(f"Position: {ctx['job_title']}")
    if ctx.get("job_description"):
        parts.append(f"Job description:\n{ctx['job_description'][:1200]}")
    if ctx.get("skills"):
        skills = ctx["skills"]
        if isinstance(skills, list):
            parts.append(f"Key skills: {', '.join(skills[:20])}")
    if ctx.get("resume_text"):
        parts.append(f"Resume:\n{ctx['resume_text'][:2500]}")
    if ctx.get("topics_asked"):
        parts.append(
            "Questions already asked (do NOT repeat or rephrase these):\n"
            + "\n".join(f"- {q[:200]}" for q in ctx["topics_asked"][:12])
        )
    if ctx.get("categories_covered"):
        parts.append(f"Categories covered: {', '.join(ctx['categories_covered'])}")
    if ctx.get("response_scores"):
        avg = sum(ctx["response_scores"]) / len(ctx["response_scores"])
        parts.append(
            f"Recent answer quality (1–5 scale): {', '.join(str(s) for s in ctx['response_scores'][-4:])} "
            f"(avg {avg:.1f})"
        )
    return "\n".join(parts)


def _normalize_question_result(result: dict | None, fallback: dict) -> dict:
    if not result or "question" not in result:
        return fallback
    category = (result.get("category") or fallback.get("category", "behavioral")).lower()
    category = category.replace("-", "_").replace(" ", "_")
    if category == "problem-solving":
        category = "problem_solving"
    return {
        "question": result["question"].strip(),
        "category": category,
        "follow_ups": result.get("follow_ups") or [],
    }


async def generate_first_question(ctx: dict[str, Any]) -> dict:
    """Generate a personalized opening question."""
    context_block = _format_context(ctx)
    company = ctx.get("company_name") or "the company"
    prompt = f"""{context_block}

This is question 1 of {ctx.get('total_questions', 6)}.

Generate the opening interview question. Requirements:
- Brief, warm greeting using the candidate's first name
- Then ONE substantive question — prefer referencing a specific resume project or skill
- If resume is sparse, ask about motivation for {ctx['role']} at {company}
- Category should be behavioral or project (not generic textbook technical)

Respond as JSON:
{{"question": "...", "category": "behavioral|project|technical", "follow_ups": []}}"""

    fallback = {
        "question": (
            f"Hi {ctx['candidate_name']}, thanks for joining today. "
            f"I'd love to start by hearing about a project you're most proud of "
            f"that's relevant to the {ctx['role']} role — what was your specific contribution?"
        ),
        "category": "project",
        "follow_ups": [],
    }
    result = await provider.generate_json(prompt, SYSTEM_INSTRUCTION)
    return _normalize_question_result(result, fallback)


async def generate_next_question(ctx: dict[str, Any]) -> dict:
    """Generate the next adaptive question with contextual follow-up logic."""
    history = ctx.get("conversation_history") or []
    history_text = "\n\n".join(
        f"Interviewer: {item['question']}\nCandidate: {item['response']}"
        for item in history
    )
    last_exchange = history[-1] if history else None
    q_num = ctx.get("question_number", len(history) + 1)
    total = ctx.get("total_questions", 6)
    is_last = q_num >= total

    context_block = _format_context(ctx)
    last_answer_note = ""
    if last_exchange:
        last_answer_note = (
            f"\nMost recent exchange:\n"
            f"Q: {last_exchange['question']}\n"
            f"A: {last_exchange['response']}\n"
            f"If the answer was vague or shallow, ask a targeted clarifying follow-up on the same topic. "
            f"If it was strong, go deeper technically or move to an uncovered area."
        )

    wrap_up = ""
    if is_last:
        wrap_up = (
            "This is the FINAL question. Ask a thoughtful wrap-up "
            "(e.g. anything they'd like the hiring team to know, or a reflection on the role fit). "
            "Category: behavioral."
        )
    else:
        uncovered = {"behavioral", "technical", "project", "problem_solving", "communication"} - set(
            (c or "").replace("-", "_") for c in (ctx.get("categories_covered") or [])
        )
        if uncovered:
            wrap_up = f"Prefer a category not yet well-covered: {', '.join(sorted(uncovered))}."

    prompt = f"""{context_block}

Question {q_num} of {total}.
{wrap_up}
{last_answer_note}

Full conversation:
{history_text or "(no prior exchanges)"}

Generate the next single interview question. Requirements:
- ONE question only, conversational tone
- Build on the candidate's last answer OR pivot to an uncovered resume area
- Reference specific technologies/projects from their resume when possible
- Do NOT repeat any topic from "Questions already asked"
- No generic definition questions

Respond as JSON:
{{"question": "...", "category": "behavioral|technical|project|problem_solving|communication", "follow_ups": []}}"""

    fallbacks_by_cat = {
        "project": (
            f"Looking at your background for this {ctx['role']} role — "
            "can you walk me through the technical architecture of one project "
            "and a key decision you'd change in hindsight?"
        ),
        "technical": (
            f"For a {ctx['role']} position, what trade-offs did you face "
            "when choosing your main tech stack on a recent project?"
        ),
        "problem_solving": (
            "Tell me about a production issue or blocker you diagnosed recently. "
            "How did you isolate root cause and what did you learn?"
        ),
        "communication": (
            "How do you align technical decisions with product or business stakeholders "
            "when priorities conflict?"
        ),
        "behavioral": (
            "Describe a situation where you had to push back on a technical decision. "
            "How did you handle it and what was the outcome?"
        ),
    }
    covered = set((c or "").replace("-", "_") for c in (ctx.get("categories_covered") or []))
    fallback_cat = next((c for c in fallbacks_by_cat if c not in covered), "behavioral")
    fallback = {
        "question": fallbacks_by_cat[fallback_cat],
        "category": fallback_cat,
        "follow_ups": [],
    }

    result = await provider.generate_json(prompt, SYSTEM_INSTRUCTION)
    return _normalize_question_result(result, fallback)
