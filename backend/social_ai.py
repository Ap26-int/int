"""AI-powered social media draft generator.

Generates a luxury-tone caption + hashtags via Claude Sonnet 4.5,
and an on-brand image via Gemini Nano Banana, then saves the image
to /app/backend/static_uploads/social/ for serving via /api/static/...
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import os
import random
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

UPLOADS_DIR = Path(__file__).parent / "static_uploads" / "social"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

CAPTION_THEMES = [
    "the quiet beauty of a well-finished marble fireplace",
    "the way warm linen catches morning light in a Delhi apartment",
    "behind the scenes — sourcing antique brass in Old Jaipur",
    "an oxblood velvet sofa as a quiet centrepiece in a bachelor's pad",
    "how a single Murano pendant changes the soul of a dining room",
    "the difference between decorated and designed — a Lumière philosophy",
    "designing for celebrities — privacy, drama, restraint",
    "before & after — a Bandra penthouse transformation",
    "the colour palette of a Lutyens villa we just completed",
    "why custom furniture always feels different from store-bought",
    "small luxury — handmade plaster cornices that take three weeks",
    "a Sunday in the studio — fabric swatches, espresso, and pencil sketches",
    "moodboard reveal — a winter project in DLF Camellias",
    "five questions our most discerning clients always ask",
    "why we choose 2700K lighting for every Lumière bedroom",
]

DEFAULT_HASHTAGS = [
    "#LumiereBySambitaBose",
    "#LuxuryInteriors",
    "#InteriorDesignIndia",
    "#CelebrityHomes",
    "#BespokeInteriors",
    "#DelhiInteriorDesigner",
    "#QuietLuxury",
    "#VillaDesign",
    "#ModernClassic",
    "#SambitaBose",
]


def _next_theme(seed: Optional[str] = None) -> str:
    if seed:
        random.seed(seed)
    return random.choice(CAPTION_THEMES)


async def generate_caption_and_hashtags(theme: Optional[str] = None) -> dict:
    """Use Claude Sonnet 4.5 via emergentintegrations to draft a luxury caption."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    chosen = theme or _next_theme()
    session_id = f"social-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"

    system = (
        "You are the social-media editor for 'Lumière By Sambita Bose', "
        "a Delhi-based ultra-luxury interior design atelier. You write for Instagram, "
        "Facebook, X and LinkedIn. Tone: sophisticated, restrained, slightly cinematic. "
        "Never use emojis. Never use exclamation marks. No hype words ('amazing', 'wow', 'unleash'). "
        "Short sentences. Quiet luxury. Indian sensibility, global eye. "
        "Always output strict JSON."
    )

    user_text = (
        f"Today's theme: {chosen}\n\n"
        "Write ONE Instagram-style post for this theme. Keep the caption under "
        "120 words. Open with a hook line of 6-12 words. End with a soft, brand-appropriate "
        "call-to-action ('Enquire via the link in our bio.' or similar — not pushy).\n\n"
        "Then propose 8 to 10 hashtags. Mix brand tags, category tags, and 1-2 location tags. "
        "Include #LumiereBySambitaBose first.\n\n"
        "Also propose a short photo direction — one sentence describing what kind of image "
        "should accompany this post. Visual must be a real interior photograph or detail "
        "(no people, no text, no logos). Dark, cinematic, gold and ivory tones, 4:5 portrait.\n\n"
        "Return strict JSON, no prose, in this exact shape:\n"
        '{"caption": "...", "hashtags": ["#a","#b",...], "image_prompt": "..."}'
    )

    chat = LlmChat(api_key=api_key, session_id=session_id, system_message=system).with_model(
        "anthropic", "claude-sonnet-4-5-20250929"
    )
    msg = UserMessage(text=user_text)
    raw = await chat.send_message(msg)

    # Robustly parse JSON (sometimes wrapped in ```json fences)
    text = (raw or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        data = json.loads(text)
    except Exception:
        # try to extract first { ... } block
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise
        data = json.loads(match.group(0))

    caption = (data.get("caption") or "").strip()
    hashtags = data.get("hashtags") or DEFAULT_HASHTAGS
    image_prompt = (data.get("image_prompt") or chosen).strip()
    return {
        "theme": chosen,
        "caption": caption,
        "hashtags": [h if h.startswith("#") else f"#{h}" for h in hashtags],
        "image_prompt": image_prompt,
    }


async def generate_brand_image(image_prompt: str) -> str:
    """Generate a 4:5 luxury interior image via Gemini Nano Banana, save to disk, return URL path."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    full_prompt = (
        "Photorealistic luxury interior photograph for an ultra-premium design brand. "
        "Cinematic, moody, dark obsidian palette with antique gold and warm ivory accents, "
        "natural soft window light. No people, no text, no logos, no signage. "
        "Composition: 4:5 portrait, centred, magazine-grade, depth-of-field. "
        f"Subject: {image_prompt}"
    )

    session_id = f"social-img-{uuid.uuid4().hex[:8]}"
    chat = (
        LlmChat(api_key=api_key, session_id=session_id, system_message="You generate luxury imagery.")
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )
    msg = UserMessage(text=full_prompt)
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        raise RuntimeError("Image generation returned no image")
    img = images[0]
    image_bytes = base64.b64decode(img["data"])
    file_id = f"{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}.png"
    out = UPLOADS_DIR / file_id
    with open(out, "wb") as f:
        f.write(image_bytes)
    # served via /api/static/social/...
    return f"/api/static/social/{file_id}"


async def generate_full_draft(theme: Optional[str] = None) -> dict:
    """One-shot: generate caption + hashtags + image. Returns dict with all fields."""
    cap = await generate_caption_and_hashtags(theme)
    try:
        image_url = await generate_brand_image(cap["image_prompt"])
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        image_url = None
    return {
        "theme": cap["theme"],
        "caption": cap["caption"],
        "hashtags": cap["hashtags"],
        "image_prompt": cap["image_prompt"],
        "image_url": image_url,
    }
