import threading
from xmlrpc.server import SimpleXMLRPCServer
from app.rpc.ur import ur_methods

HOST = "0.0.0.0"
PORT = 8080


def _run_server():
    try:
        server = SimpleXMLRPCServer((HOST, PORT), allow_none=True, logRequests=True)
        server.register_introspection_functions()
        server.register_instance(ur_methods)
        print(f"[RPC] Serveur XML-RPC en écoute sur {HOST}:{PORT}")
        server.serve_forever()
    except OSError as e:
        print(f"[RPC] Impossible de démarrer le serveur XML-RPC sur {HOST}:{PORT} : {e}")


def start_xmlrpc_server() -> threading.Thread:
    """Démarre le serveur XML-RPC dans un thread daemon pour ne pas bloquer FastAPI."""
    thread = threading.Thread(target=_run_server, daemon=True)
    thread.start()
    return thread