/* =====================================================
   NETWORK TOPOLOGY SIMULATOR
   ===================================================== */


/* ================= DEVICE DATA ================= */

const devices = {

    router: {
        name: "Router",
        type: "NETWORK ROUTER",
        icon: "R",
        ip: "192.168.1.1",
        mac: "AA:BB:CC:DD:EE:01",
        connection: "Ethernet",
        description:
            "Router berfungsi sebagai gateway yang menghubungkan jaringan lokal dengan jaringan lainnya."
    },

    switch: {
        name: "Switch",
        type: "NETWORK SWITCH",
        icon: "S",
        ip: "192.168.1.2",
        mac: "AA:BB:CC:DD:EE:02",
        connection: "Ethernet",
        description:
            "Switch menghubungkan beberapa perangkat dalam jaringan lokal dan meneruskan data menuju perangkat tujuan."
    },

    pc1: {
        name: "PC 01",
        type: "CLIENT COMPUTER",
        icon: "PC",
        ip: "192.168.1.10",
        mac: "AA:BB:CC:DD:EE:10",
        connection: "Ethernet",
        description:
            "PC 01 merupakan perangkat client yang digunakan untuk mengakses layanan jaringan."
    },

    pc2: {
        name: "PC 02",
        type: "CLIENT COMPUTER",
        icon: "PC",
        ip: "192.168.1.11",
        mac: "AA:BB:CC:DD:EE:11",
        connection: "Ethernet",
        description:
            "PC 02 merupakan perangkat client yang terhubung ke jaringan lokal."
    },

    server: {
        name: "Server",
        type: "DATA SERVER",
        icon: "SRV",
        ip: "192.168.1.100",
        mac: "AA:BB:CC:DD:EE:20",
        connection: "Ethernet",
        description:
            "Server menyediakan layanan dan data yang dapat diakses oleh perangkat client."
    },

    ap: {
        name: "Access Point",
        type: "WIRELESS ACCESS POINT",
        icon: "AP",
        ip: "192.168.1.254",
        mac: "AA:BB:CC:DD:EE:30",
        connection: "Wi-Fi",
        description:
            "Access Point menyediakan koneksi jaringan wireless untuk perangkat yang menggunakan Wi-Fi."
    }

};


/* ================= TOPOLOGIES ================= */

const topologies = {

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
        ["switch", "pc1"],
        ["pc1", "pc2"],
        ["pc2", "server"],
        ["server", "ap"]
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


/* ================= POSITIONS ================= */

const positions = {

    star: {

        router: [50, 10],
        switch: [50, 35],

        pc1: [18, 70],
        pc2: [39, 70],
        server: [61, 70],
        ap: [82, 70]

    },

    tree: {

        router: [50, 10],
        switch: [50, 34],

        pc1: [25, 65],
        pc2: [50, 65],
        server: [50, 87],
        ap: [75, 65]

    },

    bus: {

        router: [10, 50],
        switch: [28, 50],
        pc1: [45, 50],
        pc2: [62, 50],
        server: [78, 50],
        ap: [92, 50]

    },

    ring: {

        router: [50, 12],
        switch: [78, 30],
        server: [78, 70],
        ap: [50, 88],
        pc2: [22, 70],
        pc1: [22, 30]

    }

};


/* ================= VARIABLES ================= */

let currentTopology = "star";

let selectedDevice = null;

const status = {

    router: true,
    switch: true,
    pc1: true,
    pc2: true,
    server: true,
    ap: true

};


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


/* =====================================================
   POSITION DEVICES
   ===================================================== */

function positionDevices() {

    const current =
        positions[currentTopology];

    Object.keys(current).forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.style.left =
            current[id][0] + "%";

        element.style.top =
            current[id][1] + "%";

    });

    updateLabels();

}


/* =====================================================
   GET CENTER
   ===================================================== */

function getCenter(element) {

    const canvasRect =
        canvas.getBoundingClientRect();

    const rect =
        element.getBoundingClientRect();

    return {

        x:
            rect.left +
            rect.width / 2 -
            canvasRect.left,

        y:
            rect.top +
            rect.height / 2 -
            canvasRect.top

    };

}


/* =====================================================
   DRAW CONNECTIONS
   ===================================================== */

function drawConnections() {

    svg.innerHTML = "";

    const links =
        topologies[currentTopology];

    links.forEach((link, index) => {

        const from =
            document.getElementById(
                link[0]
            );

        const to =
            document.getElementById(
                link[1]
            );

        if (!from || !to) return;

        const a =
            getCenter(from);

        const b =
            getCenter(to);

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

        line.dataset.index =
            index;

        line.dataset.from =
            link[0];

        line.dataset.to =
            link[1];

        svg.appendChild(line);

    });

    document.getElementById(
        "linkCount"
    ).textContent =
        links.length;

}


/* =====================================================
   UPDATE LABEL
   ===================================================== */

function updateLabels() {

    const internet =
        document.getElementById(
            "labelInternet"
        );

    const lan =
        document.getElementById(
            "labelLan"
        );

    if (currentTopology === "star") {

        internet.style.display =
            "block";

        lan.style.display =
            "block";

        internet.style.left =
            "50%";

        internet.style.top =
            "22%";

        internet.style.transform =
            "translateX(-50%)";

        lan.style.left =
            "50%";

        lan.style.top =
            "53%";

        lan.style.transform =
            "translateX(-50%)";

    } else {

        internet.style.display =
            "none";

        lan.style.display =
            "none";

    }

}


/* =====================================================
   OPEN DETAIL
   ===================================================== */

function openDetail(id) {

    const data =
        devices[id];

    if (!data) return;

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


/* =====================================================
   DETAIL STATUS
   ===================================================== */

function updateDetailStatus() {

    const element =
        document.getElementById(
            "detailStatus"
        );

    const button =
        document.getElementById(
            "toggleDevice"
        );

    if (status[selectedDevice]) {

        element.innerHTML =
            "<span></span> ONLINE";

        element.style.color =
            "var(--green)";

        button.textContent =
            "TURN OFF";

    } else {

        element.innerHTML =
            "<span></span> OFFLINE";

        element.style.color =
            "var(--red)";

        button.textContent =
            "TURN ON";

    }

}


/* =====================================================
   CLOSE DETAIL
   ===================================================== */

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
        event => {

            if (
                event.target.id ===
                "detailOverlay"
            ) {

                closeDetail();

            }

        }
    );


/* =====================================================
   DEVICE CLICK
   ===================================================== */

document
    .querySelectorAll(
        ".network-device"
    )
    .forEach(device => {

        device.addEventListener(
            "click",
            () => {

                openDetail(
                    device.dataset.device
                );

            }
        );

    });


/* =====================================================
   SIDEBAR DEVICE CLICK
   ===================================================== */

document
    .querySelectorAll(
        ".device-menu-item"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openDetail(
                    button.dataset.device
                );

            }
        );

    });


/* =====================================================
   TOGGLE DEVICE
   ===================================================== */

document
    .getElementById(
        "toggleDevice"
    )
    .addEventListener(
        "click",
        () => {

            if (!selectedDevice)
                return;

            status[selectedDevice] =
                !status[selectedDevice];

            updateDeviceVisual(
                selectedDevice
            );

            updateDetailStatus();

            addLog(
                devices[selectedDevice].name +
                " sekarang " +
                (
                    status[selectedDevice]
                        ? "ONLINE"
                        : "OFFLINE"
                )
            );

        }
    );


/* =====================================================
   UPDATE VISUAL DEVICE
   ===================================================== */

function updateDeviceVisual(id) {

    const element =
        document.getElementById(id);

    if (!element) return;

    const state =
        element.querySelector(
            "small"
        );

    const dot =
        state.querySelector(
            "i"
        );

    if (status[id]) {

        element.classList.remove(
            "offline"
        );

        state.lastChild.textContent =
            "ONLINE";

    } else {

        element.classList.add(
            "offline"
        );

        state.lastChild.textContent =
            "OFFLINE";

    }

}


/* =====================================================
   SEND DATA
   ===================================================== */

function sendData() {

    const links =
        topologies[currentTopology];

    let link = null;

    for (const current of links) {

        if (
            status[current[0]] &&
            status[current[1]]
        ) {

            link =
                current;

            break;

        }

    }

    if (!link) {

        addLog(
            "Tidak ada koneksi aktif."
        );

        return;

    }

    animatePacket(
        link[0],
        link[1]
    );

    addLog(
        "Data dikirim dari " +
        devices[link[0]].name +
        " menuju " +
        devices[link[1]].name
    );

}


/* =====================================================
   PACKET ANIMATION
   ===================================================== */

function animatePacket(
    fromId,
    toId
) {

    const from =
        document.getElementById(
            fromId
        );

    const to =
        document.getElementById(
            toId
        );

    const start =
        getCenter(from);

    const end =
        getCenter(to);

    const duration =
        1200;

    const startTime =
        performance.now();

    packet.style.display =
        "flex";


    function animate(time) {

        const progress =
            Math.min(
                (time - startTime) /
                duration,
                1
            );

        const x =
            start.x +
            (end.x - start.x) *
            progress;

        const y =
            start.y +
            (end.y - start.y) *
            progress;

        packet.style.left =
            x + "px";

        packet.style.top =
            y + "px";


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

            packet.style.display =
                "none";

            highlightLink(
                fromId,
                toId
            );

        }

    }

    requestAnimationFrame(
        animate
    );

}


/* =====================================================
   HIGHLIGHT LINK
   ===================================================== */

function highlightLink(
    from,
    to
) {

    const lines =
        document.querySelectorAll(
            ".connection"
        );

    lines.forEach(line => {

        if (

            (
                line.dataset.from === from &&
                line.dataset.to === to
            )

            ||

            (
                line.dataset.from === to &&
                line.dataset.to === from
            )

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
                800
            );

        }

    });

}


/* =====================================================
   SEND BUTTON
   ===================================================== */

document
    .getElementById(
        "sendPacket"
    )
    .addEventListener(
        "click",
        sendData
    );


document
    .getElementById(
        "sendFromDevice"
    )
    .addEventListener(
        "click",
        () => {

            closeDetail();

            sendData();

        }
    );


/* =====================================================
   TOPOLOGY SELECT
   ===================================================== */

document
    .getElementById(
        "topologySelect"
    )
    .addEventListener(
        "change",
        event => {

            currentTopology =
                event.target.value;

            positionDevices();

            setTimeout(
                drawConnections,
                50
            );

            addLog(
                "Topologi diubah menjadi " +
                currentTopology.toUpperCase()
            );

        }
    );


/* =====================================================
   RESET
   ===================================================== */

document
    .getElementById(
        "resetNetwork"
    )
    .addEventListener(
        "click",
        () => {

            Object.keys(status)
                .forEach(id => {

                    status[id] =
                        true;

                    updateDeviceVisual(
                        id
                    );

                });

            currentTopology =
                "star";

            document.getElementById(
                "topologySelect"
            ).value =
                "star";

            positionDevices();

            setTimeout(
                drawConnections,
                50
            );

            addLog(
                "Network berhasil di-reset."
            );

        }
    );


/* =====================================================
   CLEAR LOG
   ===================================================== */

document
    .getElementById(
        "clearLog"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "logContent"
            ).innerHTML = "";

        }
    );


/* =====================================================
   LOG
   ===================================================== */

function addLog(message) {

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

    container.prepend(row);

}


/* =====================================================
   INITIALIZE
   ===================================================== */

function initialize() {

    positionDevices();

    Object.keys(status)
        .forEach(
            updateDeviceVisual
        );

    setTimeout(
        drawConnections,
        100
    );

    document.getElementById(
        "deviceCount"
    ).textContent =
        Object.keys(devices).length;

}


/* =====================================================
   RESIZE
   ===================================================== */

window.addEventListener(
    "resize",
    () => {

        drawConnections();

    }
);


/* START */

window.addEventListener(
    "load",
    initialize
);
