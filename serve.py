import http.server
import socketserver
import webbrowser
import threading
import os


PORT = 8000
HOST = "127.0.0.1"


class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Simple handler serving files from the current directory without noisy logs.
    """
    def log_message(self, format, *args):  # noqa: A003
        # Suppress default console logging for cleaner output
        pass


def start_server():
    """
    Start an HTTP server serving the current directory.
    """
    handler = QuietHTTPRequestHandler
    # Ensure we serve from this script's directory (project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    with socketserver.TCPServer((HOST, PORT), handler) as httpd:
        url = f"http://{HOST}:{PORT}/train/index.html"
        print(f"Astral Express server running at {url}")
        print("Press Ctrl+C to stop the server.")
        # Open in default browser on a separate thread (best-effort, non-blocking)
        threading.Thread(target=lambda: webbrowser.open(url), daemon=True).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    start_server()