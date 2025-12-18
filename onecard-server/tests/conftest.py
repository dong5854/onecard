import pytest
import pytest_asyncio
from httpx import AsyncClient

from onecard_api.container import ServiceContainer, get_container
from onecard_api.main import create_app


@pytest.fixture
def app():
    container = get_container()
    return create_app(container)


@pytest.fixture
def container() -> ServiceContainer:
    return get_container()


@pytest_asyncio.fixture
async def client(app):
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client
