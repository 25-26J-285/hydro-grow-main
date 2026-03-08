import asyncio
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

from app.services import image_service

router = APIRouter()


@router.post("/api/upload-frame")
async def upload_frame(request: Request):
    """Receive RGB565 frame from ESP32-CAM"""
    body = await request.body()
    success = await image_service.process_frame(body, format_type="rgb565")
    return Response(status_code=200 if success else 400)


async def _generate_video():
    """MJPEG stream generator"""
    while True:
        frame = image_service.get_current_frame()
        if frame:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        await asyncio.sleep(0.05)


@router.get("/video_feed")
async def video_feed():
    """Stream processed MJPEG video feed"""
    return StreamingResponse(
        _generate_video(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.get("/api/snapshot")
async def get_snapshot():
    """Return the latest camera frame as a JPEG image"""
    frame = image_service.get_current_frame()
    if frame is None:
        return Response(status_code=503, content="No frame available")
    return Response(content=frame, media_type="image/jpeg")
