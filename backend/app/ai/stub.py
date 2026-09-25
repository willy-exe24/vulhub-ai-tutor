"""Deterministic placeholder AI responses, used when no provider API key is
configured. These let every AI-powered feature be exercised end-to-end without
a live key; real responses take over automatically once one is set.
"""

from app.models import Lab

STUB_NOTICE = (
    "[Stubbed response — no AI API key is configured. Add one to backend/.env "
    "to get real AI-generated content.]"
)


def _label(lab: Lab) -> str:
    return lab.cve or lab.name


def stub_explanation(lab: Lab) -> dict:
    label = _label(lab)
    category = lab.category or "an unclassified vulnerability"
    return {
        "what_is_it": (
            f"{STUB_NOTICE} {label} is a vulnerability in {lab.product}, "
            f"categorized here as {category}."
        ),
        "why_it_happens": (
            "Configure an AI API key to get a real root-cause explanation generated "
            "from this lab's README."
        ),
        "attacker_impact": "Configure an AI API key to see the potential attacker impact.",
        "what_to_learn": (
            f"• Read {lab.product}'s README for this lab\n"
            "• Configure an AI API key for a tailored learning-objectives list"
        ),
        "detection": "Configure an AI API key to see detection guidance for this lab.",
        "mitigation": "Configure an AI API key to see mitigation guidance for this lab.",
        "stubbed": True,
    }


def stub_chat_reply(lab: Lab, question: str) -> str:
    return (
        f"{STUB_NOTICE}\n\nYou asked about {_label(lab)}: \"{question}\"\n\n"
        "Once an OpenAI or Anthropic API key is set in backend/.env, this tutor will "
        "answer using this lab's README and CVE context."
    )


def stub_explain_command(command: str) -> str:
    return f"{STUB_NOTICE}\n\nCommand entered: {command}"


def stub_quiz_questions(lab: Lab) -> list[dict]:
    label = _label(lab)
    return [
        {
            "question": f"{STUB_NOTICE} What product does this lab target?",
            "type": "multiple_choice",
            "options": [lab.product, "Apache Tomcat", "MySQL", "OpenSSH"],
            "correct_answer": lab.product,
            "explanation": f"This lab ({label}) is built around {lab.product}.",
        },
        {
            "question": f"This lab is currently categorized as '{lab.category or 'Uncategorized'}'. True or false?",
            "type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "Category shown as stored for this lab (heuristically inferred).",
        },
        {
            "question": "Configure an AI API key to generate a real intermediate question.",
            "type": "short_answer",
            "options": None,
            "correct_answer": "ai key required",
            "explanation": "Placeholder question — add an API key for real content.",
        },
        {
            "question": "Configure an AI API key to generate a real intermediate question.",
            "type": "short_answer",
            "options": None,
            "correct_answer": "ai key required",
            "explanation": "Placeholder question — add an API key for real content.",
        },
        {
            "question": "Configure an AI API key to generate a real advanced question.",
            "type": "short_answer",
            "options": None,
            "correct_answer": "ai key required",
            "explanation": "Placeholder question — add an API key for real content.",
        },
    ]


def stub_study_notes(lab: Lab) -> str:
    return (
        f"{STUB_NOTICE}\n\n"
        f"{_label(lab)}\n\n"
        f"Product:\n{lab.product}\n\n"
        f"Category:\n{lab.category or 'Unknown'}\n\n"
        "Root Cause:\nConfigure an AI API key to generate this section.\n\n"
        "Potential Impact:\nConfigure an AI API key to generate this section.\n\n"
        "Detection:\nConfigure an AI API key to generate this section.\n\n"
        "Mitigation:\nConfigure an AI API key to generate this section.\n\n"
        "What I Learned:\n• Add an OpenAI or Anthropic key to backend/.env for real notes"
    )
