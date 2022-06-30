from http.client import HTTPResponse
import logging
from typing import Dict, List
import uuid
from fastapi import FastAPI, Request, Response, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi import WebSocket
import os
from pathlib import Path

from app.range_response import range_requests_response

logger = logging.getLogger(__name__)
app = FastAPI(
    title='Watch together',
)

templates = Jinja2Templates(directory='templates')
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: Dict, websocket: WebSocket):
        for connection in self.active_connections:
            if connection != websocket:
                await connection.send_json(message)


managers = {}


@app.get('/', response_class=HTTPResponse)
def index(request: Request) -> Response:
    videos = sorted(Path('uploads').glob('*.mp4'))
    videos = [video.with_suffix('').name for video in videos]
    return templates.TemplateResponse('index.html', {
        'request': request,
        'videos': videos,
    })


@app.get('/player/{video_name}', response_class=HTTPResponse)
def index(video_name: str, request: Request) -> Response:
    return templates.TemplateResponse('player.html', {
        'request': request,
        'video_name': video_name,
    })


@app.websocket("/ws/{video_name}")
async def websocket_endpoint(video_name: str, websocket: WebSocket):
    if managers.get(video_name) is None:
        managers[video_name] = ConnectionManager()
    manager = managers[video_name]

    socket_id = str(uuid.uuid4())
    await manager.connect(websocket)
    try:
        await manager.send_personal_message({'type': 'hello', 'id': socket_id}, websocket)
        while True:
            data = await websocket.receive_json()
            data['from'] = socket_id
            await manager.broadcast(data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        if len(managers[video_name].active_connections) == 0:
            del managers[video_name]


@app.get("/video/{video_name}")
def get_video(video_name: str, request: Request):
    video_path = os.path.join('uploads', video_name)
    return range_requests_response(
        request, file_path=video_path, content_type="video/mp4"
    )
