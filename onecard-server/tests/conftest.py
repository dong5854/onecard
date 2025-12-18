import pytest
import pytest_asyncio
from httpx import AsyncClient

from onecard_api.container import get_container
from onecard_api.main import create_app


@pytest.fixture
def app():
    return create_app(get_container())


@pytest_asyncio.fixture
async def client(app):
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client
