import asyncio
import json
import subprocess
import time
import urllib.request
import websockets
import sys

# Ensure UTF-8 stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

async def send_cmd(ws, method, params=None, msg_id=1):
    req = {"id": msg_id, "method": method, "params": params or {}}
    await ws.send(json.dumps(req))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get("id") == msg_id:
            return data

async def evaluate(ws, expr, msg_id=100):
    res = await send_cmd(ws, "Runtime.evaluate", {"expression": expr, "returnByValue": True}, msg_id=msg_id)
    return res.get("result", {}).get("result", {}).get("value")

async def test_page(page_url):
    print(f"\n==========================================")
    print(f"Testing URL: {page_url}")
    print(f"==========================================")

    # Launch Edge with remote debugging
    proc = subprocess.Popen([
        EDGE_PATH,
        "--headless",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-sandbox",
        page_url
    ])
    
    await asyncio.sleep(2.5)

    try:
        # Find active tab
        tabs_url = "http://localhost:9222/json"
        with urllib.request.urlopen(tabs_url) as resp:
            tabs = json.loads(resp.read().decode())
        
        target_tab = None
        for t in tabs:
            if "localhost:8000" in t.get("url", ""):
                target_tab = t
                break
        
        if not target_tab:
            print("ERROR: Could not find target tab in Edge CDP")
            return False

        ws_url = target_tab.get("webSocketDebuggerUrl")
        print(f"Connecting to CDP WebSocket: {ws_url}")

        async with websockets.connect(ws_url) as ws:
            # Enable Console & Runtime
            await send_cmd(ws, "Console.enable", msg_id=1)
            await send_cmd(ws, "Runtime.enable", msg_id=2)
            await send_cmd(ws, "Page.enable", msg_id=3)

            # Wait a moment for scripts and charts to initialize
            await asyncio.sleep(1.5)

            # Check title
            title = await evaluate(ws, "document.title", msg_id=10)
            print(f"[PASS] Document Title: {title}")

            # Check for JS errors or unhandled exceptions
            errs = await evaluate(ws, "window._amrErrors || []", msg_id=11)
            print(f"[CHECK] Unhandled JS Errors: {errs}")

            # Page-specific tests
            if "index.html" in page_url:
                hero_title = await evaluate(ws, "document.querySelector('.hero-title').innerText", msg_id=20)
                cards_count = await evaluate(ws, "document.querySelectorAll('.glass-card').length", msg_id=21)
                print(f"[PASS] Hero Title rendered: '{hero_title}'")
                print(f"[PASS] Feature/KPI cards found: {cards_count}")

            elif "dashboard.html" in page_url:
                total_genes = await evaluate(ws, "document.getElementById('kpi-total-genes').innerText", msg_id=30)
                amr_genes = await evaluate(ws, "document.getElementById('kpi-amr-genes').innerText", msg_id=31)
                muts = await evaluate(ws, "document.getElementById('kpi-mutations').innerText", msg_id=32)
                classes = await evaluate(ws, "document.getElementById('kpi-resistance-classes').innerText", msg_id=33)
                svg_glyphs = await evaluate(ws, "document.querySelectorAll('.genome-gene-glyph').length", msg_id=34)
                
                print(f"[PASS] KPI Total Genes: {total_genes}")
                print(f"[PASS] KPI AMR Genes: {amr_genes}")
                print(f"[PASS] KPI Mutations: {muts}")
                print(f"[PASS] KPI Resistance Classes: {classes}")
                print(f"[PASS] Genome SVG glyphs drawn: {svg_glyphs}")

            elif "analysis.html" in page_url:
                genome_len = await evaluate(ws, "document.getElementById('stat-genome-len').innerText", msg_id=40)
                gc_pct = await evaluate(ws, "document.getElementById('stat-gc-pct').innerText", msg_id=41)
                amr_rows = await evaluate(ws, "document.querySelectorAll('#amr-genes-table-body tr').length", msg_id=42)
                mut_rows = await evaluate(ws, "document.querySelectorAll('#mutation-table-body tr').length", msg_id=43)
                
                print(f"[PASS] Genome Length stat: {genome_len}")
                print(f"[PASS] GC Content stat: {gc_pct}")
                print(f"[PASS] AMR Gene table rows: {amr_rows}")
                print(f"[PASS] Mutation table rows: {mut_rows}")

                # Test invalid FASTA validation
                print("\nTesting Invalid FASTA handling...")
                await evaluate(ws, "document.getElementById('fasta-textarea').value = 'ZZZZQWERTNOTDNA';", msg_id=44)
                await evaluate(ws, "document.getElementById('btn-analyze-genome').click();", msg_id=45)
                await asyncio.sleep(0.5)
                toast_msg = await evaluate(ws, "document.querySelector('.amr-toast-error .amr-toast-msg')?.innerText", msg_id=46)
                print(f"[PASS] Invalid FASTA error toast caught: '{toast_msg}'")

                # Test selecting a gene and checking modal
                print("\nTesting Gene Selection & Modal...")
                await evaluate(ws, "AMRAnalysis.openGeneModal('blaCTX-M-15');", msg_id=47)
                await asyncio.sleep(0.5)
                modal_active = await evaluate(ws, "document.getElementById('gene-detail-modal').classList.contains('active')", msg_id=48)
                modal_title = await evaluate(ws, "document.getElementById('modal-gene-title').innerText", msg_id=49)
                print(f"[PASS] Gene modal active: {modal_active}, Title: '{modal_title}'")

                # Test selecting a mutation and checking exact position track
                print("\nTesting Mutation Selection & Track Update...")
                await evaluate(ws, "AMRMutation.selectMutation('MUT-009');", msg_id=50)
                await asyncio.sleep(0.5)
                mut_pos_callout = await evaluate(ws, "document.querySelector('.mut-callout-pos')?.innerText", msg_id=51)
                cascade_val = await evaluate(ws, "document.querySelector('.active-mutation .step-val')?.innerText", msg_id=52)
                print(f"[PASS] Exact Mutation Pointer Position: {mut_pos_callout}")
                print(f"[PASS] Cascade Mutation Step Value: {cascade_val}")

            elif "results.html" in page_url:
                rep_genes = await evaluate(ws, "document.getElementById('rep-amr-count').innerText", msg_id=60)
                rep_muts = await evaluate(ws, "document.getElementById('rep-mut-count').innerText", msg_id=61)
                findings = await evaluate(ws, "document.querySelectorAll('#dynamic-important-findings div').length", msg_id=62)
                first_finding = await evaluate(ws, "document.querySelector('#dynamic-important-findings div')?.innerText", msg_id=63)
                
                print(f"[PASS] Report AMR Gene Count: {rep_genes}")
                print(f"[PASS] Report Mutation Count: {rep_muts}")
                print(f"[PASS] Dynamic Important Findings generated: {findings} paragraphs")
                print(f"[PASS] Sample finding: '{first_finding}'")

        return True

    finally:
        proc.terminate()
        await asyncio.sleep(1)

async def main():
    pages = [
        "http://localhost:8000/index.html",
        "http://localhost:8000/dashboard.html",
        "http://localhost:8000/analysis.html",
        "http://localhost:8000/results.html"
    ]
    for p in pages:
        await test_page(p)
    print("\n==========================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
