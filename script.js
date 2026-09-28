/* =========================================================
   NETWORK TOPOLOGY SIMULATOR
   DIFFERENT ANIMATION FOR EACH TOPOLOGY
   ========================================================= */


/* =========================================================
   DEVICE DATA
   ========================================================= */

const devices = {

    router: {
        name: "Router",
        type: "NETWORK ROUTER",
        icon: "R",
        ip: "192.168.1.1",
        mac: "AA:BB:CC:DD:EE:01",
        connection: "Ethernet",
        description:
            "Router berfungsi sebagai gateway jaringan."
    },

    switch: {
        name: "Switch",
        type: "NETWORK SWITCH",
        icon: "S",
        ip: "192.168.1.2",
        mac: "AA:BB:CC:DD:EE:02",
        connection: "Ethernet",
        description:
            "Switch meneruskan frame ke perangkat tujuan dalam jaringan lokal."
    },

    pc1: {
        name: "PC 01",
        type: "CLIENT COMPUTER",
        icon: "PC",
        ip: "192.168.1.10",
        mac: "AA:BB:CC:DD:EE:10",
        connection: "Ethernet",
        description:
            "PC 01 merupakan perangkat client."
    },

    pc2: {
        name: "PC 02",
        type: "CLIENT COMPUTER",
        icon: "PC",
        ip: "192.168.1.11",
        mac: "AA:BB:CC:DD:EE:11",
        connection: "Ethernet",
        description:
            "PC 02 merupakan perangkat client."
    },

    server: {
        name: "Server",
        type: "DATA SERVER",
        icon: "SRV",
        ip: "192.168.1.100",
        mac: "AA:BB:CC:DD:EE:20",
        connection: "Ethernet",
        description:
            "Server menyediakan layanan dan data jaringan."
    },

    ap: {
        name: "Access Point",
        type: "WIRELESS ACCESS POINT",
        icon: "AP",
        ip: "192.168.1.254",
        mac: "AA:BB:CC:DD:EE:30",
        connection: "Wi-Fi",
        description:
            "Access Point menyediakan koneksi wireless."
    }

};


/* =========================================================
   TOPOLOGY
   ========================================================= */

const topologyData = {

    star: {

        title:
            "Star Topology",

        description:
            "Semua perangkat terhubung ke satu perangkat pusat yaitu switch.",

        links: [

            ["router", "switch"],
            ["switch", "pc1"],
            ["switch", "pc2"],
            ["switch", "server"],
            ["switch", "ap"]

        ]

    },


    tree: {

        title:
            "Tree Topology",

        description:
            "Data mengikuti struktur hierarki dari root menuju cabang jaringan.",

        links: [

            ["router", "switch"],
            ["switch", "pc1"],
            ["switch", "pc2"],
            ["pc2", "server"],
            ["pc2", "ap"]

        ]

    },


    bus: {

        title:
            "Bus Topology",

        description:
            "Semua perangkat berada pada satu jalur backbone utama.",

        links: [

            ["router", "switch"],
            ["switch", "pc1"],
            ["pc1", "pc2"],
            ["pc2", "server"],
            ["server", "ap"]

        ]

    },


    ring: {

        title:
            "Ring Topology",

        description:
            "Setiap perangkat terhubung membentuk jalur tertutup.",

        links: [

            ["router", "switch"],
            ["switch", "server"],
            ["server", "ap"],
            ["ap", "pc2"],
            ["pc2", "pc1"],
            ["pc1", "router"]

        ]

    }

};


/* =========================================================
   POSITIONS
   ========================================================= */

const positions = {

    star: {

        router: [50, 12],

        switch: [50, 40],

        pc1: [16, 78],
        pc2: [38, 78],
        server: [62, 78],
        ap: [84, 78]

    },


    tree: {

        router: [50, 10],

        switch: [50, 34],

        pc1: [25, 63],

        pc2: [50, 63],

        server: [50, 88],

        ap: [76, 63]

    },


    bus: {

        router: [8, 50],

        switch: [27, 50],

        pc1: [43, 50],

        pc2: [59, 50],

        server: [76, 50],

        ap: [92, 50]

    },


    ring: {

        router: [50, 10],

        switch: [78, 28],

        server: [78, 72],

        ap: [50, 90],

        pc2: [22, 72],

        pc1: [22, 28]

    }

};


/* =========================================================
   STATE
   ========================================================= */

let currentTopology =
    "star";

let animationRunning =
    false;

let selectedDevice =
    null;


const deviceStatus = {

    router: true,
    switch: true,
    pc1: true,
    pc2: true,
    server: true,
    ap: true

};


/* =========================================================
   ELEMENT
   ========================================================= */

const canvas =
    document.getElementById(
        "networkCanvas"
    );

const svg =
    document.getElementById(
        "connectionSvg"
    );

const packet =
    document.getElementById(
        "packet"
    );


/* =========================================================
   POSITION DEVICE
   ========================================================= */

function positionDevices() {

    const pos =
        positions[
            currentTopology
        ];

    Object.keys(pos).forEach(id => {

        const el =
            document.getElementById(id);

        el.style.left =
            pos[id][0] + "%";

        el.style.top =
            pos[id][1] + "%";

    });

}


/* =========================================================
   GET CENTER
   ========================================================= */

function getCenter(id) {

    const element =
        document.getElementById(id);

    const rect =
        element.getBoundingClientRect();

    const canvasRect =
        canvas.getBoundingClientRect();

    return {

        x:
            rect.left -
            canvasRect.left +
            rect.width / 2,

        y:
            rect.top -
            canvasRect.top +
            rect.height / 2

    };

}


/* =========================================================
   DRAW LINES
   ========================================================= */

function drawConnections() {

    svg.innerHTML = "";

    const links =
        topologyData[
            currentTopology
        ].links;


    links.forEach(
        (link, index) => {

            const a =
                getCenter(
                    link[0]
                );

            const b =
                getCenter(
                    link[1]
                );


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            line.setAttribute(
                "x1",
                a.x
            );

            line.setAttribute(
                "y1",
                a.y
            );

            line.setAttribute(
                "x2",
                b.x
            );

            line.setAttribute(
                "y2",
                b.y
            );


            line.classList.add(
                "connection"
            );


            line.dataset.from =
                link[0];

            line.dataset.to =
                link[1];

            line.dataset.index =
                index;


            svg.appendChild(
                line
            );

        }
    );


    document.getElementById(
        "linkCount"
    ).textContent =
        links.length;

}


/* =========================================================
   CHANGE TOPOLOGY
   ========================================================= */

function changeTopology(
    type
) {

    currentTopology =
        type;


    animationRunning =
        false;


    packet.style.display =
        "none";


    const data =
        topologyData[type];


    document.getElementById(
        "topologyTitle"
    ).textContent =
        data.title;


    document.getElementById(
        "topologyDescription"
    ).textContent =
        data.description;


    positionDevices();


    setTimeout(
        drawConnections,
        100
    );


    addLog(
        "Topology → " +
        type.toUpperCase()
    );

}


/* =========================================================
   TOPOLOGY SELECT
   ========================================================= */

document
    .getElementById(
        "topologySelect"
    )
    .addEventListener(
        "change",
        e => {

            changeTopology(
                e.target.value
            );

        }
    );


/* =========================================================
   HIGHLIGHT LINE
   ========================================================= */

function highlightLine(
    from,
    to
) {

    const lines =
        document.querySelectorAll(
            ".connection"
        );


    lines.forEach(
        line => {

            const same =
                line.dataset.from === from &&
                line.dataset.to === to;


            const reverse =
                line.dataset.from === to &&
                line.dataset.to === from;


            if (
                same ||
                reverse
            ) {

                line.classList.add(
                    "active"
                );

                setTimeout(
                    () => {

                        line.classList.remove(
                            "active"
                        );

                    },
                    700
                );

            }

        }
    );

}


/* =========================================================
   MOVE PACKET
   ========================================================= */

function movePacket(
    from,
    to,
    duration = 800
) {

    return new Promise(
        resolve => {

            const start =
                getCenter(from);

            const end =
                getCenter(to);


            const startTime =
                performance.now();


            packet.style.display =
                "flex";


            function animate(
                currentTime
            ) {

                let progress =
                    (
                        currentTime -
                        startTime
                    ) /
                    duration;


                progress =
                    Math.min(
                        progress,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const x =
                    start.x +
                    (
                        end.x -
                        start.x
                    ) *
                    eased;


                const y =
                    start.y +
                    (
                        end.y -
                        start.y
                    ) *
                    eased;


                packet.style.left =
                    x + "px";

                packet.style.top =
                    y + "px";


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    resolve();

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}


/* =========================================================
   DELAY
   ========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   STAR ANIMATION
   ========================================================= */

async function animateStar() {

    addLog(
        "★ STAR: packet masuk ke central switch"
    );


    highlightLine(
        "router",
        "switch"
    );


    await movePacket(
        "router",
        "switch",
        900
    );


    /*
       SWITCH PULSE
       Ini yang membedakan STAR.
    */

    const sw =
        document.getElementById(
            "switch"
        );


    sw.style.transform =
        "translate(-50%, -50%) scale(1.25)";

    sw.style.filter =
        "drop-shadow(0 0 25px #35d6ff)";


    addLog(
        "★ SWITCH: meneruskan packet ke port tujuan"
    );


    await wait(450);


    sw.style.transform =
        "translate(-50%, -50%) scale(1)";

    sw.style.filter =
        "none";


    highlightLine(
        "switch",
        "server"
    );


    await movePacket(
        "switch",
        "server",
        900
    );


    addLog(
        "★ STAR: packet sampai SERVER"
    );

}


/* =========================================================
   TREE ANIMATION
   ========================================================= */

async function animateTree() {

    addLog(
        "▲ TREE: packet masuk ke root"
    );


    highlightLine(
        "router",
        "switch"
    );


    await movePacket(
        "router",
        "switch",
        850
    );


    addLog(
        "▲ TREE: switch menentukan cabang"
    );


    await wait(250);


    /*
       Cabang utama.
    */

    highlightLine(
        "switch",
        "pc2"
    );


    await movePacket(
        "switch",
        "pc2",
        850
    );


    /*
       Cabang berikutnya.
    */

    addLog(
        "▲ TREE: packet turun ke child node"
    );


    highlightLine(
        "pc2",
        "server"
    );


    await movePacket(
        "pc2",
        "server",
        850
    );


    addLog(
        "▲ TREE: packet sampai SERVER"
    );

}


/* =========================================================
   BUS ANIMATION
   ========================================================= */

async function animateBus() {

    addLog(
        "━ BUS: packet masuk ke backbone"
    );


    /*
       BUS berbeda:
       semua node berada pada
       satu jalur horizontal.
    */

    const route = [

        "router",
        "switch",
        "pc1",
        "pc2",
        "server"

    ];


    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {

        const from =
            route[i];

        const to =
            route[i + 1];


        addLog(
            "━ BUS: signal melewati " +
            devices[to].name
        );


        highlightLine(
            from,
            to
        );


        await movePacket(
            from,
            to,
            550
        );


        /*
           Efek backbone pulse.
        */

        pulseNode(
            to,
            180
        );

    }


    addLog(
        "━ BUS: packet diterima SERVER"
    );

}


/* =========================================================
   RING ANIMATION
   ========================================================= */

async function animateRing() {

    addLog(
        "◎ RING: packet bergerak searah jarum jam"
    );


    /*
       Paket benar-benar mengelilingi
       struktur ring.
    */

    const ringRoute = [

        "router",
        "switch",
        "server",
        "ap",
        "pc2",
        "pc1"

    ];


    for (
        let i = 0;
        i < ringRoute.length - 1;
        i++
    ) {

        const from =
            ringRoute[i];

        const to =
            ringRoute[i + 1];


        highlightLine(
            from,
            to
        );


        addLog(
            "◎ RING: " +
            devices[from].name +
            " → " +
            devices[to].name
        );


        await movePacket(
            from,
            to,
            650
        );

    }


    /*
       Tutup kembali ring
       menuju router.
    */

    highlightLine(
        "pc1",
        "router"
    );


    await movePacket(
        "pc1",
        "router",
        650
    );


    addLog(
        "◎ RING: packet menyelesaikan satu putaran ring"
    );


    /*
       Setelah satu putaran,
       baru diteruskan menuju server.
    */

    highlightLine(
        "router",
        "switch"
    );


    await movePacket(
        "router",
        "switch",
        500
    );


    highlightLine(
        "switch",
        "server"
    );


    await movePacket(
        "switch",
        "server",
        700
    );


    addLog(
        "◎ RING: packet sampai SERVER"
    );

}


/* =========================================================
   NODE PULSE
   ========================================================= */

function pulseNode(
    id,
    duration
) {

    const node =
        document.getElementById(
            id
        );


    node.style.transform =
        "translate(-50%, -50%) scale(1.18)";


    node.style.filter =
        "drop-shadow(0 0 18px #35d6ff)";


    setTimeout(
        () => {

            node.style.transform =
                "translate(-50%, -50%) scale(1)";

            node.style.filter =
                "none";

        },
        duration
    );

}


/* =========================================================
   SEND DATA
   ========================================================= */

async function sendData() {

    if (
        animationRunning
    ) {

        addLog(
            "Packet sebelumnya masih berjalan..."
        );

        return;

    }


    /*
       Cek perangkat.
    */

    const required = {

        star: [
            "router",
            "switch",
            "server"
        ],

        tree: [
            "router",
            "switch",
            "pc2",
            "server"
        ],

        bus: [
            "router",
            "switch",
            "pc1",
            "pc2",
            "server"
        ],

        ring: [
            "router",
            "switch",
            "server",
            "ap",
            "pc2",
            "pc1"
        ]

    };


    for (
        const id
        of required[currentTopology]
    ) {

        if (
            !deviceStatus[id]
        ) {

            addLog(
                "ERROR: " +
                devices[id].name +
                " OFFLINE"
            );

            return;

        }

    }


    animationRunning =
        true;


    addLog(
        "────────────────────────"
    );


    addLog(
        "SEND DATA → " +
        currentTopology.toUpperCase()
    );


    try {

        /*
           STAR
        */

        if (
            currentTopology ===
            "star"
        ) {

            await animateStar();

        }


        /*
           TREE
        */

        else if (
            currentTopology ===
            "tree"
        ) {

            await animateTree();

        }


        /*
           BUS
        */

        else if (
            currentTopology ===
            "bus"
        ) {

            await animateBus();

        }


        /*
           RING
        */

        else if (
            currentTopology ===
            "ring"
        ) {

            await animateRing();

        }


        addLog(
            "✓ DATA TRANSMISSION COMPLETE"
        );


    } finally {

        packet.style.display =
            "none";

        animationRunning =
            false;

    }

}


/* =========================================================
   SEND BUTTON
   ========================================================= */

document
    .getElementById(
        "sendPacket"
    )
    .addEventListener(
        "click",
        sendData
    );


/* =========================================================
   RESET
   ========================================================= */

document
    .getElementById(
        "resetNetwork"
    )
    .addEventListener(
        "click",
        () => {

            animationRunning =
                false;


            packet.style.display =
                "none";


            Object.keys(
                deviceStatus
            ).forEach(id => {

                deviceStatus[id] =
                    true;

                updateDeviceStatus(
                    id
                );

            });


            currentTopology =
                "star";


            document.getElementById(
                "topologySelect"
            ).value =
                "star";


            changeTopology(
                "star"
            );


            addLog(
                "NETWORK RESET"
            );

        }
    );


/* =========================================================
   DEVICE STATUS
   ========================================================= */

function updateDeviceStatus(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        deviceStatus[id]
    ) {

        element.classList.remove(
            "offline"
        );

        const small =
            element.querySelector(
                "small"
            );

        small.innerHTML =
            "● ONLINE";

    } else {

        element.classList.add(
            "offline"
        );

        const small =
            element.querySelector(
                "small"
            );

        small.innerHTML =
            "● OFFLINE";

    }

}


/* =========================================================
   DETAIL PANEL
   ========================================================= */

function openDetail(
    id
) {

    const data =
        devices[id];


    selectedDevice =
        id;


    document.getElementById(
        "detailIcon"
    ).textContent =
        data.icon;


    document.getElementById(
        "detailType"
    ).textContent =
        data.type;


    document.getElementById(
        "detailName"
    ).textContent =
        data.name;


    document.getElementById(
        "detailIP"
    ).textContent =
        data.ip;


    document.getElementById(
        "detailMAC"
    ).textContent =
        data.mac;


    document.getElementById(
        "detailDeviceType"
    ).textContent =
        data.name;


    document.getElementById(
        "detailConnection"
    ).textContent =
        data.connection;


    document.getElementById(
        "detailDescription"
    ).textContent =
        data.description;


    updateDetailStatus();


    document
        .getElementById(
            "detailOverlay"
        )
        .classList.add(
            "show"
        );

}


function updateDetailStatus() {

    const box =
        document.getElementById(
            "detailStatus"
        );


    if (
        deviceStatus[selectedDevice]
    ) {

        box.innerHTML =
            "<span></span> ONLINE";

        box.style.color =
            "var(--green)";

    } else {

        box.innerHTML =
            "<span></span> OFFLINE";

        box.style.color =
            "var(--red)";

    }

}


function closeDetail() {

    document
        .getElementById(
            "detailOverlay"
        )
        .classList.remove(
            "show"
        );

    selectedDevice =
        null;

}


/* =========================================================
   DEVICE CLICK
   ========================================================= */

document
    .querySelectorAll(
        ".network-device"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    openDetail(
                        element.dataset.device
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        ".device-menu-item"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    openDetail(
                        element.dataset.device
                    );

                }
            );

        }
    );


document
    .getElementById(
        "closeDetail"
    )
    .addEventListener(
        "click",
        closeDetail
    );


document
    .getElementById(
        "detailOverlay"
    )
    .addEventListener(
        "click",
        e => {

            if (
                e.target.id ===
                "detailOverlay"
            ) {

                closeDetail();

            }

        }
    );


/* =========================================================
   TOGGLE DEVICE
   ========================================================= */

document
    .getElementById(
        "toggleDevice"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !selectedDevice
            ) return;


            deviceStatus[
                selectedDevice
            ] =
                !deviceStatus[
                    selectedDevice
                ];


            updateDeviceStatus(
                selectedDevice
            );


            updateDetailStatus();


            addLog(
                devices[selectedDevice].name +
                " → " +
                (
                    deviceStatus[
                        selectedDevice
                    ]
                        ? "ONLINE"
                        : "OFFLINE"
                )
            );

        }
    );


/* =========================================================
   CLEAR LOG
   ========================================================= */

document
    .getElementById(
        "clearLog"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "logContent"
            ).innerHTML =
                "";

        }
    );


/* =========================================================
   LOG
   ========================================================= */

function addLog(
    message
) {

    const container =
        document.getElementById(
            "logContent"
        );


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "log-row";


    const time =
        new Date()
            .toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


    row.innerHTML = `
        <span>${time}</span>
        ${message}
    `;


    container.prepend(
        row
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

    positionDevices();


    Object.keys(
        deviceStatus
    ).forEach(
        updateDeviceStatus
    );


    setTimeout(
        drawConnections,
        200
    );


    document.getElementById(
        "deviceCount"
    ).textContent =
        Object.keys(
            devices
        ).length;

}


window.addEventListener(
    "resize",
    () => {

        drawConnections();

    }
);


window.addEventListener(
    "load",
    initialize
);
