"""Social media publisher stubs.

Each platform has a `post(...)` async function returning a dict:
  { "ok": bool, "platform": str, "external_id": str | None, "mocked": bool, "error": str | None }

When the user provides real API credentials (env vars OR via /api/social/credentials UI),
replace each MOCK block with the live implementation per the integration playbook for that platform.

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


async def _credentials_from_db(platform: str) -> dict:
    try:
        from server import db  # avoid circular import at module load
        doc = await db.social_credentials.find_one({"platform": platform}, {"_id": 0})
        return (doc or {}).get("fields", {})
    except Exception:
        return {}


def _is_configured(platform: str) -> bool:
    """Env-only check (used at boot for legacy behaviour)."""
    if platform == "instagram":
        return bool(os.environ.get("IG_BUSINESS_ACCOUNT_ID")) and bool(os.environ.get("META_PAGE_ACCESS_TOKEN"))
    if platform == "facebook":
        return bool(os.environ.get("FB_PAGE_ID")) and bool(os.environ.get("META_PAGE_ACCESS_TOKEN"))
    if platform == "twitter":
        return all(os.environ.get(k) for k in ("X_BEARER_TOKEN", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"))
    if platform == "linkedin":
        return bool(os.environ.get("LINKEDIN_ACCESS_TOKEN")) and bool(os.environ.get("LINKEDIN_AUTHOR_URN"))
    return False


async def _resolve_credentials(platform: str) -> dict:
    """Merge DB creds (preferred) with .env fallback. Returns empty if unconfigured."""
    db_creds = await _credentials_from_db(platform)
    if platform == "instagram":
        return {
            "ig_business_account_id": db_creds.get("ig_business_account_id") or os.environ.get("IG_BUSINESS_ACCOUNT_ID", ""),
            "page_access_token": db_creds.get("page_access_token") or os.environ.get("META_PAGE_ACCESS_TOKEN", ""),
        }
    if platform == "facebook":
        return {
            "fb_page_id": db_creds.get("fb_page_id") or os.environ.get("FB_PAGE_ID", ""),
            "page_access_token": db_creds.get("page_access_token") or os.environ.get("META_PAGE_ACCESS_TOKEN", ""),
        }
    if platform == "twitter":
        return {
            "bearer_token": db_creds.get("bearer_token") or os.environ.get("X_BEARER_TOKEN", ""),
            "access_token": db_creds.get("access_token") or os.environ.get("X_ACCESS_TOKEN", ""),
            "access_token_secret": db_creds.get("access_token_secret") or os.environ.get("X_ACCESS_TOKEN_SECRET", ""),
        }
    if platform == "linkedin":
        return {
            "access_token": db_creds.get("access_token") or os.environ.get("LINKEDIN_ACCESS_TOKEN", ""),
            "author_urn": db_creds.get("author_urn") or os.environ.get("LINKEDIN_AUTHOR_URN", ""),
        }
    return {}


async def _is_resolved(platform: str) -> bool:
    creds = await _resolve_credentials(platform)
    return all(bool(v) for v in creds.values())


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
    if not await _is_resolved("instagram"):
        return await _mock_post("instagram", _compose(caption, hashtags), image_url)
    # TODO: wire Meta Graph API (POST /{ig-user-id}/media -> /media_publish)
    return await _mock_post("instagram", _compose(caption, hashtags), image_url)


async def post_facebook(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not await _is_resolved("facebook"):
        return await _mock_post("facebook", _compose(caption, hashtags), image_url)
    return await _mock_post("facebook", _compose(caption, hashtags), image_url)


async def post_twitter(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not await _is_resolved("twitter"):
        return await _mock_post("twitter", _compose(caption, hashtags, max_chars=270), image_url)
    return await _mock_post("twitter", _compose(caption, hashtags, max_chars=270), image_url)


async def post_linkedin(caption: str, image_url: Optional[str], hashtags: list[str]) -> dict:
    if not await _is_resolved("linkedin"):
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
    """Synchronous env-only view (used at startup for logs)."""
    return {p: _is_configured(p) for p in PLATFORMS}
