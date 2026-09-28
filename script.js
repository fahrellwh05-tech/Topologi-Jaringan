/* =========================================================
   NETWORK TOPOLOGY SIMULATOR
   STAR / TREE / BUS / RING
========================================================= */

const canvas = document.getElementById("networkCanvas");
const svg = document.getElementById("connectionSvg");
const packet = document.getElementById("packet");
const busLine = document.getElementById("busLine");

const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");

const packetCountEl = document.getElementById("packetCount");
const hopCountEl = document.getElementById("hopCount");
const latencyEl = document.getElementById("latency");
const packetStatusEl = document.getElementById("packetStatus");

const titleEl = document.getElementById("title");
const descriptionEl = document.getElementById("description");
const currentModeEl = document.getElementById("currentMode");
const activityLog = document.getElementById("activityLog");
const logStatus = document.getElementById("logStatus");

let currentTopology = "star";
let packetCount = 0;
let hopCount = 0;
let running = false;


/* =========================================================
   DEVICE ELEMENT
========================================================= */

const devices = {
    router: document.getElementById("router"),
    switch: document.getElementById("switch"),
    pc1: document.getElementById("pc1"),
    pc2: document.getElementById("pc2"),
    server: document.getElementById("server"),
    ap: document.getElementById("ap")
};


/* =========================================================
   TOPOLOGY INFORMATION
========================================================= */

const topologyInfo = {

    star: {
        title: "STAR TOPOLOGY",

        description:
            "Semua perangkat terhubung melalui satu switch pusat.",

        positions: {
            router: [50, 14],
            switch: [50, 50],
            pc1: [18, 76],
            pc2: [38, 86],
            server: [82, 76],
            ap: [62, 86]
        }
    },

    tree: {
        title: "TREE TOPOLOGY",

        description:
            "Data bergerak secara hierarki dari root menuju cabang dan perangkat tujuan.",

        positions: {
            router: [50, 12],
            switch: [50, 36],
            pc1: [20, 64],
            pc2: [43, 64],
            server: [70, 64],
            ap: [88, 64]
        }
    },

    bus: {
        title: "BUS TOPOLOGY",

        description:
            "Semua perangkat menggunakan satu backbone jaringan bersama.",

        positions: {
            router: [10, 50],
            pc1: [27, 28],
            switch: [43, 50],
            pc2: [58, 72],
            server: [75, 28],
            ap: [90, 50]
        }
    },

    ring: {
        title: "RING TOPOLOGY",

        description:
            "Perangkat membentuk jalur melingkar dan paket berjalan mengikuti arah ring.",

        positions: {
            router: [50, 15],
            switch: [80, 34],
            server: [80, 70],
            ap: [50, 87],
            pc2: [20, 70],
            pc1: [20, 34]
        }
    }
};


/* =========================================================
   TOPOLOGY LINKS
========================================================= */

const links = {

    star: [
        ["router", "switch"],
        ["switch", "pc1"],
        ["switch", "pc2"],
        ["switch", "server"],
        ["switch", "ap"]
    ],

    tree: [
        ["router", "switch"],
        ["switch", "pc1"],
        ["switch", "pc2"],
        ["pc2", "server"],
        ["pc2", "ap"]
    ],

    bus: [
        ["router", "switch"],
        ["switch", "ap"]
    ],

    ring: [
        ["router", "switch"],
        ["switch", "server"],
        ["server", "ap"],
        ["ap", "pc2"],
        ["pc2", "pc1"],
        ["pc1", "router"]
    ]
};


/* =========================================================
   UTILITIES
========================================================= */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function setDevicePosition(id, x, y) {
    devices[id].style.left = `${x}%`;
    devices[id].style.top = `${y}%`;
}


function clearDeviceStates() {

    Object.values(devices).forEach(device => {

        device.classList.remove(
            "active",
            "receive",
            "ring-active"
        );

    });
}


function clearSvg() {
    svg.innerHTML = "";
}


function setPacketPosition(x, y) {

    packet.style.left = `${x}px`;
    packet.style.top = `${y}px`;
}


function getPosition(id) {

    const rect = devices[id].getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2
    };
}


/* =========================================================
   LOG
========================================================= */

function addLog(message) {

    const now = new Date();

    const time =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0");

    const item = document.createElement("div");

    item.className = "log-item";

    item.innerHTML = `
        <span class="log-time">${time}</span>
        <span>${message}</span>
    `;

    activityLog.prepend(item);

    while (activityLog.children.length > 12) {
        activityLog.removeChild(activityLog.lastChild);
    }
}


/* =========================================================
   DRAW NORMAL CONNECTION
========================================================= */

function drawLine(id1, id2, className = "") {

    const p1 = getPosition(id1);
    const p2 = getPosition(id2);

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);

    line.classList.add("connection");

    if (className) {
        line.classList.add(className);
    }

    svg.appendChild(line);

    return line;
}


/* =========================================================
   DRAW TOPOLOGY
========================================================= */

function drawTopology() {

    clearSvg();

    busLine.style.display = "none";

    const data = topologyInfo[currentTopology];

    Object.entries(data.positions).forEach(([id, pos]) => {
        setDevicePosition(id, pos[0], pos[1]);
    });

    /*
       Give browser time to update positions
       before calculating line coordinates.
    */

    requestAnimationFrame(() => {

        clearSvg();

        if (currentTopology === "bus") {

            drawBusTopology();

        } else {

            links[currentTopology].forEach(link => {

                drawLine(link[0], link[1]);

            });

        }

        if (currentTopology === "ring") {
            createRingDecoration();
        }

    });
}


/* =========================================================
   BUS TOPOLOGY DRAW
========================================================= */

function drawBusTopology() {

    const p1 = getPosition("router");
    const p2 = getPosition("ap");

    busLine.style.display = "block";

    busLine.style.left = `${p1.x}px`;
    busLine.style.top = `${p1.y - 3}px`;

    busLine.style.width = `${p2.x - p1.x}px`;

    /*
       Vertical taps from devices to backbone.
    */

    const taps = [
        ["pc1", "bus"],
        ["pc2", "bus"],
        ["server", "bus"]
    ];

    taps.forEach(([id]) => {

        const p = getPosition(id);

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        line.setAttribute("x1", p.x);
        line.setAttribute("y1", p.y);
        line.setAttribute("x2", p.x);
        line.setAttribute("y2", getPosition("router").y);

        line.classList.add("connection");

        svg.appendChild(line);
    });
}


/* =========================================================
   RING DECORATION
========================================================= */

function createRingDecoration() {

    const order = [
        "router",
        "switch",
        "server",
        "ap",
        "pc2",
        "pc1"
    ];

    const points = order.map(id => getPosition(id));

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {

        d += ` L ${points[i].x} ${points[i].y}`;

    }

    d += ` L ${points[0].x} ${points[0].y}`;

    const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    path.setAttribute("d", d);
    path.classList.add("connection");

    svg.appendChild(path);
}


/* =========================================================
   ACTIVATE CONNECTION
========================================================= */

function activateConnection(id1, id2, className = "active") {

    const lines = svg.querySelectorAll(".connection");

    const p1 = getPosition(id1);
    const p2 = getPosition(id2);

    lines.forEach(line => {

        const x1 = Number(line.getAttribute("x1"));
        const y1 = Number(line.getAttribute("y1"));
        const x2 = Number(line.getAttribute("x2"));
        const y2 = Number(line.getAttribute("y2"));

        const match =
            (
                Math.abs(x1 - p1.x) < 3 &&
                Math.abs(y1 - p1.y) < 3 &&
                Math.abs(x2 - p2.x) < 3 &&
                Math.abs(y2 - p2.y) < 3
            )
            ||
            (
                Math.abs(x1 - p2.x) < 3 &&
                Math.abs(y1 - p2.y) < 3 &&
                Math.abs(x2 - p1.x) < 3 &&
                Math.abs(y2 - p1.y) < 3
            );

        if (match) {
            line.classList.add(className);
        }
    });
}


/* =========================================================
   MOVE PACKET STRAIGHT
========================================================= */

function movePacketTo(id, duration = 900) {

    const target = getPosition(id);

    return movePacketXY(
        target.x,
        target.y,
        duration
    );
}


function movePacketXY(targetX, targetY, duration = 900) {

    const startX =
        parseFloat(packet.style.left) || 0;

    const startY =
        parseFloat(packet.style.top) || 0;

    return new Promise(resolve => {

        const startTime = performance.now();

        function animate(now) {

            const progress =
                Math.min(
                    (now - startTime) / duration,
                    1
                );

            /*
               Smooth ease-in-out
            */

            const eased =
                progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(
                        -2 * progress + 2,
                        2
                    ) / 2;

            const x =
                startX +
                (targetX - startX) * eased;

            const y =
                startY +
                (targetY - startY) * eased;

            setPacketPosition(x, y);

            if (progress < 1) {

                requestAnimationFrame(animate);

            } else {

                resolve();

            }
        }

        requestAnimationFrame(animate);
    });
}


/* =========================================================
   DEVICE PULSE
========================================================= */

async function pulseDevice(
    id,
    className = "active",
    duration = 450
) {

    devices[id].classList.add(className);

    await sleep(duration);

    devices[id].classList.remove(className);
}


/* =========================================================
   PACKET TRAIL
========================================================= */

function createTrail() {

    const trail = document.createElement("div");

    trail.className = "packet-trail";

    trail.style.left = packet.style.left;
    trail.style.top = packet.style.top;

    canvas.appendChild(trail);

    setTimeout(() => {

        trail.style.opacity = "0";

        setTimeout(() => {
            trail.remove();
        }, 400);

    }, 50);
}


/* =========================================================
   STAR ANIMATION
=========================================================

   STAR:
   ROUTER
      ↓
   SWITCH
      ↓
   DISTRIBUTION
      ↓
   SERVER

   Ciri khas:
   - Switch menjadi pusat
   - Packet masuk ke switch
   - Switch melakukan broadcast/pulse
   - Jalur switch-server menyala
========================================================= */

async function animateStar() {

    addLog("STAR: Router mengirim packet ke switch.");

    hopCount = 1;
    updateStats();

    await movePacketTo("switch", 1000);

    await pulseDevice("switch", "active", 500);

    addLog("STAR: Switch menerima packet.");

    /*
       Broadcast effect
    */

    const targets = [
        "pc1",
        "pc2",
        "server",
        "ap"
    ];

    for (const id of targets) {

        devices[id].classList.add("active");

        await sleep(100);

    }

    await sleep(350);

    devices.pc1.classList.remove("active");
    devices.pc2.classList.remove("active");
    devices.ap.classList.remove("active");

    /*
       Actual packet continues to server.
    */

    activateConnection(
        "switch",
        "server",
        "active"
    );

    hopCount = 2;
    updateStats();

    addLog("STAR: Switch meneruskan packet ke SERVER.");

    await movePacketTo("server", 1100);

    await pulseDevice(
        "server",
        "receive",
        800
    );

    addLog("STAR: Data berhasil diterima SERVER.");

}


/* =========================================================
   TREE ANIMATION
=========================================================

   TREE:
              ROUTER
                 ↓
              SWITCH
             /     \
           PC1      PC2
                     ↓
                   SERVER

   Ciri khas:
   - Hierarchical
   - Tidak broadcast
   - Packet turun level demi level
========================================================= */

async function animateTree() {

    addLog("TREE: Packet mulai dari root ROUTER.");

    hopCount = 1;
    updateStats();

    await movePacketTo("switch", 900);

    await pulseDevice(
        "switch",
        "active",
        400
    );

    addLog("TREE: Packet turun ke cabang SWITCH.");

    /*
       Packet memilih cabang PC2.
    */

    activateConnection(
        "switch",
        "pc2",
        "active"
    );

    hopCount = 2;
    updateStats();

    addLog("TREE: Packet masuk ke cabang PC2.");

    await movePacketTo("pc2", 900);

    await pulseDevice(
        "pc2",
        "active",
        350
    );

    /*
       Dari PC2 turun lagi ke SERVER.
    */

    activateConnection(
        "pc2",
        "server",
        "active"
    );

    hopCount = 3;
    updateStats();

    addLog("TREE: PC2 meneruskan packet ke SERVER.");

    await movePacketTo("server", 1000);

    await pulseDevice(
        "server",
        "receive",
        800
    );

    addLog("TREE: Data berhasil mencapai SERVER.");

}


/* =========================================================
   BUS ANIMATION
=========================================================

   BUS:

   ROUTER ========================================= AP
            ↑        ↑       ↑       ↑
           PC1      SW      PC2    SERVER

   Ciri khas:
   - Packet berjalan sepanjang backbone
   - Tidak pindah router -> switch -> server
   - Semua node mendengarkan jalur bersama
========================================================= */

async function animateBus() {

    addLog("BUS: Packet masuk ke shared backbone.");

    busLine.classList.add(
        "active",
        "bus-flow"
    );

    /*
       Start dari ROUTER
    */

    const start = getPosition("router");

    setPacketPosition(
        start.x,
        start.y
    );

    /*
       Packet bergerak sepanjang garis BUS.
    */

    const end = getPosition("ap");

    const duration = 2200;

    const startTime = performance.now();

    hopCount = 0;
    updateStats();

    await new Promise(resolve => {

        function animate(now) {

            const progress =
                Math.min(
                    (now - startTime) / duration,
                    1
                );

            const x =
                start.x +
                (end.x - start.x) *
                progress;

            setPacketPosition(
                x,
                start.y
            );

            /*
               Node taps detect packet.
            */

            const nodes = [
                "pc1",
                "switch",
                "pc2",
                "server"
            ];

            nodes.forEach(id => {

                const node = getPosition(id);

                if (
                    Math.abs(x - node.x) < 7
                ) {

                    devices[id].classList.add(
                        "active"
                    );

                }

            });

            if (progress < 1) {

                requestAnimationFrame(animate);

            } else {

                resolve();

            }
        }

        requestAnimationFrame(animate);

    });

    /*
       Server becomes destination.
    */

    await sleep(250);

    hopCount = 1;
    updateStats();

    addLog(
        "BUS: SERVER mendeteksi packet pada backbone."
    );

    await pulseDevice(
        "server",
        "receive",
        900
    );

    busLine.classList.remove(
        "active",
        "bus-flow"
    );

    Object.values(devices).forEach(device => {
        device.classList.remove("active");
    });

    addLog(
        "BUS: Data berhasil diterima SERVER."
    );

}


/* =========================================================
   RING ANIMATION
=========================================================

   RING:

                  ROUTER
               ↗         ↘
            PC1           SWITCH
             ↑             ↓
            PC2           SERVER
               ↖         ↙
                  AP

   Ciri khas:
   - Packet mengikuti jalur melingkar
   - Tidak ada switch pusat
   - Jalur ring menyala berurutan
========================================================= */

async function animateRing() {

    const route = [
        "router",
        "switch",
        "server"
    ];

    addLog(
        "RING: Packet masuk ke jalur ring."
    );

    /*
       ROUTER -> SWITCH
    */

    activateConnection(
        "router",
        "switch",
        "ring-active"
    );

    devices.router.classList.add(
        "ring-active"
    );

    await movePacketTo(
        "switch",
        800
    );

    devices.router.classList.remove(
        "ring-active"
    );

    devices.switch.classList.add(
        "ring-active"
    );

    hopCount = 1;
    updateStats();

    addLog(
        "RING: Packet bergerak clockwise ke SWITCH."
    );

    /*
       SWITCH -> SERVER
    */

    activateConnection(
        "switch",
        "server",
        "ring-active"
    );

    await sleep(150);

    await movePacketTo(
        "server",
        900
    );

    devices.switch.classList.remove(
        "ring-active"
    );

    devices.server.classList.add(
        "ring-active"
    );

    hopCount = 2;
    updateStats();

    addLog(
        "RING: Packet mencapai SERVER."
    );

    await sleep(200);

    /*
       Ring keeps rotating briefly
       to visualize circular topology.
    */

    const ringOrder = [
        "server",
        "ap",
        "pc2",
        "pc1",
        "router"
    ];

    for (const id of ringOrder) {

        devices[id].classList.add(
            "ring-active"
        );

        await sleep(120);

        devices[id].classList.remove(
            "ring-active"
        );
    }

    await pulseDevice(
        "server",
        "receive",
        900
    );

    addLog(
        "RING: Data berhasil diterima SERVER."
    );

}


/* =========================================================
   START TRANSMISSION
========================================================= */

async function sendData() {

    if (running) return;

    running = true;

    sendBtn.disabled = true;

    packet.style.display = "block";

    clearDeviceStates();

    hopCount = 0;

    packetCount++;

    packetStatusEl.textContent = "TRANSMITTING";

    logStatus.textContent = "TRANSMITTING";

    latencyEl.textContent =
        Math.floor(
            15 + Math.random() * 30
        ) + " ms";

    updateStats();

    /*
       Packet starts from ROUTER.
    */

    const start = getPosition("router");

    setPacketPosition(
        start.x,
        start.y
    );

    devices.router.classList.add(
        "active"
    );

    await sleep(300);

    devices.router.classList.remove(
        "active"
    );


    try {

        if (currentTopology === "star") {

            await animateStar();

        }

        else if (currentTopology === "tree") {

            await animateTree();

        }

        else if (currentTopology === "bus") {

            await animateBus();

        }

        else if (currentTopology === "ring") {

            await animateRing();

        }

    }

    catch (error) {

        console.error(error);

        addLog(
            "ERROR: Animasi mengalami masalah."
        );

    }


    /*
       Transmission finished.
    */

    packet.style.display = "none";

    clearDeviceStates();

    document
        .querySelectorAll(".connection")
        .forEach(line => {

            line.classList.remove(
                "active",
                "ring-active",
                "bus-active"
            );

        });

    packetStatusEl.textContent = "DELIVERED";

    logStatus.textContent = "DELIVERED";

    running = false;

    sendBtn.disabled = false;

    updateStats();

}


/* =========================================================
   RESET
========================================================= */

function resetSimulation() {

    if (running) return;

    packet.style.display = "none";

    clearDeviceStates();

    packetCount = 0;
    hopCount = 0;

    packetStatusEl.textContent = "IDLE";

    latencyEl.textContent = "0 ms";

    logStatus.textContent = "READY";

    busLine.classList.remove(
        "active",
        "bus-flow"
    );

    drawTopology();

    updateStats();

    addLog(
        "Simulation berhasil di-reset."
    );
}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats() {

    packetCountEl.textContent =
        packetCount;

    hopCountEl.textContent =
        hopCount;
}


/* =========================================================
   CHANGE TOPOLOGY
========================================================= */

function changeTopology(topology) {

    if (running) return;

    currentTopology = topology;

    const data =
        topologyInfo[topology];

    titleEl.textContent =
        data.title;

    descriptionEl.textContent =
        data.description;

    currentModeEl.textContent =
        data.title;

    document
        .querySelectorAll(".topology-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.topology === topology
            );

        });

    packetStatusEl.textContent = "IDLE";

    latencyEl.textContent = "0 ms";

    clearDeviceStates();

    drawTopology();

    addLog(
        `Mode berubah ke ${data.title}.`
    );
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

document
    .querySelectorAll(".topology-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                changeTopology(
                    button.dataset.topology
                );

            }
        );

    });


sendBtn.addEventListener(
    "click",
    sendData
);


resetBtn.addEventListener(
    "click",
    resetSimulation
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (!running) {

            drawTopology();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "load",
    () => {

        drawTopology();

        updateStats();

        addLog(
            "Network simulator initialized."
        );

    }
);
