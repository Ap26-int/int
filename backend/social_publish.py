"""Social media publisher stubs.

Each platform has a `post(...)` async function returning a dict:
  { "ok": bool, "platform": str, "external_id": str | None, "mocked": bool, "error": str | None }

When the user provides real API credentials (env vars), replace each MOCK block with
the live implementation per the integration playbook for that platform.

Configured platforms required tokens:
  - Instagram   IG_BUSINESS_ACCOUNT_ID, META_PAGE_ACCESS_TOKEN
  - Facebook    FB_PAGE_ID, META_PAGE_ACCESS_TOKEN
  - Twitter/X   X_BEARER_TOKEN, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET (paid tier)
  - LinkedIn    LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN
"""
from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

PLATFORMS = ("instagram", "facebook", "twitter", "linkedin")


def _is_configured(platform: str) -> bool:
    if platform == "instagram":
        return bool(os.environ.get("IG_BUSINESS_ACCOUNT_ID")) and bool(os.environ.get("META_PAGE_ACCESS_TOKEN"))
    if platform == "facebook":
        return bool(os.environ.get("FB_PAGE_ID")) and bool(os.environ.get("META_PAGE_ACCESS_TOKEN"))
    if platform == "twitter":
        return all(os.environ.get(k) for k in ("X_BEARER_TOKEN", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"))
    if platform == "linkedin":
        return bool(os.environ.get("LINKEDIN_ACCESS_TOKEN")) and bool(os.environ.get("LINKEDIN_AUTHOR_URN"))
    return False


async def _mock_post(platform: str, caption: str, image_url: Optional[str]) -> dict:
    logger.info(f"[MOCK PUBLISH] platform={platform} image={image_url} caption_preview={caption[:80]!r}")
    return {
        "ok": True,
        "platform": platform,
        "external_id": None,
        "mocked": True,
        "error": None,
    }


async def post_instagram(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not _is_configured("instagram"):
        return await _mock_post("instagram", _compose(caption, hashtags), image_url)
    # TODO: wire Meta Graph API (POST /{ig-user-id}/media -> /media_publish)
    return await _mock_post("instagram", _compose(caption, hashtags), image_url)


async def post_facebook(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not _is_configured("facebook"):
        return await _mock_post("facebook", _compose(caption, hashtags), image_url)
    return await _mock_post("facebook", _compose(caption, hashtags), image_url)


async def post_twitter(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not _is_configured("twitter"):
        return await _mock_post("twitter", _compose(caption, hashtags, max_chars=270), image_url)
    return await _mock_post("twitter", _compose(caption, hashtags, max_chars=270), image_url)


async def post_linkedin(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not _is_configured("linkedin"):
        return await _mock_post("linkedin", _compose(caption, hashtags), image_url)
    return await _mock_post("linkedin", _compose(caption, hashtags), image_url)


def _compose(caption: str, hashtags: list[str], max_chars: int | None = None) -> str:
    text = caption.strip()
    if hashtags:
        text = text + "\n\n" + " ".join(hashtags)
    if max_chars and len(text) > max_chars:
        text = text[: max_chars - 1].rstrip() + "…"
    return text


PUBLISHERS = {
    "instagram": post_instagram,
    "facebook": post_facebook,
    "twitter": post_twitter,
    "linkedin": post_linkedin,
}


async def publish_to_platforms(
    platforms: list[str], caption: str, image_url: Optional[str], hashtags: list[str]
) -> list[dict]:
    """Dispatch to all selected platforms in parallel. Failures are isolated per platform."""
    import asyncio

    valid = [p for p in platforms if p in PUBLISHERS]
    if not valid:
        return []
    results = await asyncio.gather(
        *[PUBLISHERS[p](caption, image_url, hashtags) for p in valid],
        return_exceptions=True,
    )
    out: list[dict] = []
    for p, r in zip(valid, results):
        if isinstance(r, Exception):
            out.append({"ok": False, "platform": p, "external_id": None, "mocked": False, "error": str(r)})
        else:
            out.append(r)
    return out


def configured_platforms() -> dict[str, bool]:
    return {p: _is_configured(p) for p in PLATFORMS}
