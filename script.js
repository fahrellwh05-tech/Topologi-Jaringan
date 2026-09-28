"use strict";


/* =========================================================
   WAIT FOR HTML
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       GET ELEMENT
    ===================================================== */

    const canvas =
        document.getElementById("networkCanvas");

    const svg =
        document.getElementById("networkSvg");

    const packet =
        document.getElementById("packet");

    const busLine =
        document.getElementById("busLine");

    const sendBtn =
        document.getElementById("sendBtn");

    const resetBtn =
        document.getElementById("resetBtn");

    const pageTitle =
        document.getElementById("pageTitle");

    const pageDescription =
        document.getElementById("pageDescription");

    const currentMode =
        document.getElementById("currentMode");

    const packetCountEl =
        document.getElementById("packetCount");

    const hopCountEl =
        document.getElementById("hopCount");

    const latencyEl =
        document.getElementById("latency");

    const packetStatusEl =
        document.getElementById("packetStatus");

    const logStatus =
        document.getElementById("logStatus");

    const activityLog =
        document.getElementById("activityLog");


    /* =====================================================
       DEVICE
    ===================================================== */

    const device = {

        router:
            document.getElementById("router"),

        switch:
            document.getElementById("switch"),

        pc1:
            document.getElementById("pc1"),

        pc2:
            document.getElementById("pc2"),

        server:
            document.getElementById("server"),

        ap:
            document.getElementById("ap")

    };


    /* =====================================================
       VARIABLES
    ===================================================== */

    let topology = "star";

    let packets = 0;

    let hops = 0;

    let running = false;


    /* =====================================================
       TOPOLOGY DATA
    ===================================================== */

    const data = {

        star: {

            title:
                "STAR TOPOLOGY",

            description:
                "Semua perangkat terhubung melalui satu switch pusat.",

            positions: {

                router: [50, 15],

                switch: [50, 48],

                pc1: [18, 78],

                pc2: [39, 86],

                server: [82, 78],

                ap: [62, 86]

            }

        },


        tree: {

            title:
                "TREE TOPOLOGY",

            description:
                "Data bergerak secara hierarki dari root menuju cabang.",

            positions: {

                router: [50, 13],

                switch: [50, 34],

                pc1: [20, 63],

                pc2: [43, 63],

                server: [70, 63],

                ap: [88, 63]

            }

        },


        bus: {

            title:
                "BUS TOPOLOGY",

            description:
                "Semua perangkat menggunakan satu jalur backbone bersama.",

            positions: {

                router: [10, 50],

                pc1: [27, 27],

                switch: [43, 50],

                pc2: [58, 73],

                server: [75, 27],

                ap: [90, 50]

            }

        },


        ring: {

            title:
                "RING TOPOLOGY",

            description:
                "Perangkat membentuk jalur melingkar.",

            positions: {

                router: [50, 14],

                switch: [80, 34],

                server: [80, 70],

                ap: [50, 87],

                pc2: [20, 70],

                pc1: [20, 34]

            }

        }

    };


    /* =====================================================
       SLEEP
    ===================================================== */

    function sleep(ms) {

        return new Promise(
            resolve => setTimeout(resolve, ms)
        );

    }


    /* =====================================================
       APPLY POSITIONS
    ===================================================== */

    function applyPositions() {

        const positions =
            data[topology].positions;

        for (const id in positions) {

            device[id].style.left =
                positions[id][0] + "%";

            device[id].style.top =
                positions[id][1] + "%";

        }

    }


    /* =====================================================
       GET POSITION
    ===================================================== */

    function getPosition(id) {

        const rect =
            device[id].getBoundingClientRect();

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


    /* =====================================================
       LOG
    ===================================================== */

    function log(message) {

        const now =
            new Date();

        const time =
            now.getHours()
                .toString()
                .padStart(2, "0")
            +
            ":"
            +
            now.getMinutes()
                .toString()
                .padStart(2, "0")
            +
            ":"
            +
            now.getSeconds()
                .toString()
                .padStart(2, "0");


        const row =
            document.createElement("div");

        row.className =
            "log-item";

        row.innerHTML = `
            <span>${time}</span>
            <p>${message}</p>
        `;

        activityLog.prepend(row);

    }


    /* =====================================================
       DRAW LINE
    ===================================================== */

    function line(from, to) {

        const a =
            getPosition(from);

        const b =
            getPosition(to);


        const element =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        element.setAttribute(
            "x1",
            a.x
        );

        element.setAttribute(
            "y1",
            a.y
        );

        element.setAttribute(
            "x2",
            b.x
        );

        element.setAttribute(
            "y2",
            b.y
        );


        element.classList.add(
            "connection"
        );


        element.dataset.from =
            from;

        element.dataset.to =
            to;


        svg.appendChild(element);


        return element;

    }


    /* =====================================================
       CLEAR LINES
    ===================================================== */

    function clearLines() {

        svg.innerHTML = "";

    }


    /* =====================================================
       DRAW STAR
    ===================================================== */

    function drawStar() {

        clearLines();

        line("router", "switch");

        line("switch", "pc1");

        line("switch", "pc2");

        line("switch", "server");

        line("switch", "ap");

    }


    /* =====================================================
       DRAW TREE
    ===================================================== */

    function drawTree() {

        clearLines();

        line("router", "switch");

        line("switch", "pc1");

        line("switch", "pc2");

        line("pc2", "server");

        line("pc2", "ap");

    }


    /* =====================================================
       DRAW BUS
    ===================================================== */

    function drawBus() {

        clearLines();

        busLine.style.display =
            "block";


        const router =
            getPosition("router");

        const ap =
            getPosition("ap");


        busLine.style.left =
            router.x + "px";

        busLine.style.top =
            router.y + "px";

        busLine.style.width =
            (ap.x - router.x) + "px";


        const backboneY =
            router.y;


        const taps = [
            "pc1",
            "switch",
            "pc2",
            "server"
        ];


        taps.forEach(id => {

            const p =
                getPosition(id);


            const tap =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            tap.setAttribute(
                "x1",
                p.x
            );

            tap.setAttribute(
                "y1",
                p.y
            );

            tap.setAttribute(
                "x2",
                p.x
            );

            tap.setAttribute(
                "y2",
                backboneY
            );


            tap.classList.add(
                "connection"
            );


            tap.dataset.from =
                id;

            tap.dataset.to =
                "backbone";


            svg.appendChild(tap);

        });

    }


    /* =====================================================
       DRAW RING
    ===================================================== */

    function drawRing() {

        clearLines();

        line("router", "switch");

        line("switch", "server");

        line("server", "ap");

        line("ap", "pc2");

        line("pc2", "pc1");

        line("pc1", "router");

    }


    /* =====================================================
       DRAW TOPOLOGY
    ===================================================== */

    function drawTopology() {

        applyPositions();

        busLine.style.display =
            "none";


        requestAnimationFrame(
            function () {

                if (topology === "star") {

                    drawStar();

                }

                if (topology === "tree") {

                    drawTree();

                }

                if (topology === "bus") {

                    drawBus();

                }

                if (topology === "ring") {

                    drawRing();

                }

            }
        );

    }


    /* =====================================================
       CLEAR DEVICE
    ===================================================== */

    function clearDevices() {

        for (const id in device) {

            device[id]
                .classList
                .remove(
                    "active",
                    "receive",
                    "ring-active"
                );

        }

    }


    /* =====================================================
       ACTIVATE LINE
    ===================================================== */

    function activateLine(
        from,
        to,
        className = "active"
    ) {

        const lines =
            svg.querySelectorAll(
                ".connection"
            );


        lines.forEach(item => {

            const a =
                item.dataset.from;

            const b =
                item.dataset.to;


            if (
                (a === from && b === to)
                ||
                (a === to && b === from)
            ) {

                item.classList.add(
                    className
                );

            }

        });

    }


    /* =====================================================
       MOVE PACKET
    ===================================================== */

    function movePacket(
        id,
        duration = 900
    ) {

        const target =
            getPosition(id);


        return movePacketXY(
            target.x,
            target.y,
            duration
        );

    }


    function movePacketXY(
        targetX,
        targetY,
        duration
    ) {

        const startX =
            parseFloat(
                packet.style.left
            ) || 0;


        const startY =
            parseFloat(
                packet.style.top
            ) || 0;


        return new Promise(
            resolve => {

                const start =
                    performance.now();


                function animation(now) {

                    const progress =
                        Math.min(
                            (now - start) /
                            duration,
                            1
                        );


                    const ease =
                        progress < 0.5
                        ?
                        2 *
                        progress *
                        progress
                        :
                        1 -
                        Math.pow(
                            -2 *
                            progress +
                            2,
                            2
                        ) /
                        2;


                    const x =
                        startX +
                        (
                            targetX -
                            startX
                        ) *
                        ease;


                    const y =
                        startY +
                        (
                            targetY -
                            startY
                        ) *
                        ease;


                    packet.style.left =
                        x + "px";

                    packet.style.top =
                        y + "px";


                    if (
                        progress < 1
                    ) {

                        requestAnimationFrame(
                            animation
                        );

                    }

                    else {

                        resolve();

                    }

                }


                requestAnimationFrame(
                    animation
                );

            }
        );

    }


    /* =====================================================
       PULSE DEVICE
    ===================================================== */

    async function pulse(
        id,
        type = "active"
    ) {

        device[id]
            .classList
            .add(type);


        await sleep(450);


        device[id]
            .classList
            .remove(type);

    }


    /* =====================================================
       STAR ANIMATION
    ===================================================== */

    async function animateStar() {

        log(
            "STAR: Router mengirim data ke switch."
        );


        activateLine(
            "router",
            "switch"
        );


        await movePacket(
            "switch",
            1000
        );


        hops = 1;

        updateStats();


        await pulse(
            "switch"
        );


        log(
            "STAR: Switch menerima packet."
        );


        /*
           Broadcast
        */

        device.pc1
            .classList
            .add("active");

        device.pc2
            .classList
            .add("active");

        device.ap
            .classList
            .add("active");


        await sleep(400);


        device.pc1
            .classList
            .remove("active");

        device.pc2
            .classList
            .remove("active");

        device.ap
            .classList
            .remove("active");


        /*
           Destination
        */

        activateLine(
            "switch",
            "server"
        );


        await movePacket(
            "server",
            1000
        );


        hops = 2;

        updateStats();


        await pulse(
            "server",
            "receive"
        );


        log(
            "STAR: Server menerima data."
        );

    }


    /* =====================================================
       TREE ANIMATION
    ===================================================== */

    async function animateTree() {

        log(
            "TREE: Router menjadi root."
        );


        activateLine(
            "router",
            "switch"
        );


        await movePacket(
            "switch",
            800
        );


        hops = 1;

        updateStats();


        await pulse(
            "switch"
        );


        log(
            "TREE: Packet turun ke cabang PC2."
        );


        activateLine(
            "switch",
            "pc2"
        );


        await movePacket(
            "pc2",
            850
        );


        hops = 2;

        updateStats();


        await pulse(
            "pc2"
        );


        log(
            "TREE: PC2 meneruskan packet."
        );


        activateLine(
            "pc2",
            "server"
        );


        await movePacket(
            "server",
            900
        );


        hops = 3;

        updateStats();


        await pulse(
            "server",
            "receive"
        );


        log(
            "TREE: Server menerima data."
        );

    }


    /* =====================================================
       BUS ANIMATION
    ===================================================== */

    async function animateBus() {

        log(
            "BUS: Packet masuk ke backbone."
        );


        busLine.classList.add(
            "active"
        );


        const start =
            getPosition("router");

        const end =
            getPosition("ap");


        packet.style.left =
            start.x + "px";

        packet.style.top =
            start.y + "px";


        const duration =
            2500;


        const begin =
            performance.now();


        await new Promise(
            resolve => {


                function animate(now) {

                    const progress =
                        Math.min(
                            (now - begin) /
                            duration,
                            1
                        );


                    const x =
                        start.x +
                        (
                            end.x -
                            start.x
                        ) *
                        progress;


                    packet.style.left =
                        x + "px";

                    packet.style.top =
                        start.y + "px";


                    /*
                       Device mendengarkan
                       backbone
                    */

                    [
                        "pc1",
                        "switch",
                        "pc2",
                        "server"
                    ].forEach(
                        id => {

                            const p =
                                getPosition(id);


                            if (
                                Math.abs(
                                    x - p.x
                                ) < 8
                            ) {

                                device[id]
                                    .classList
                                    .add(
                                        "active"
                                    );

                            }

                            else {

                                device[id]
                                    .classList
                                    .remove(
                                        "active"
                                    );

                            }

                        }
                    );


                    if (
                        progress < 1
                    ) {

                        requestAnimationFrame(
                            animate
                        );

                    }

                    else {

                        resolve();

                    }

                }


                requestAnimationFrame(
                    animate
                );

            }
        );


        await sleep(250);


        hops = 1;

        updateStats();


        await pulse(
            "server",
            "receive"
        );


        clearDevices();


        busLine.classList.remove(
            "active"
        );


        log(
            "BUS: Server menerima data dari backbone."
        );

    }


    /* =====================================================
       RING ANIMATION
    ===================================================== */

    async function animateRing() {

        log(
            "RING: Packet masuk ke jalur ring."
        );


        /*
           ROUTER
           ↓
           SWITCH
        */

        activateLine(
            "router",
            "switch",
            "ring-active"
        );


        await movePacket(
            "switch",
            850
        );


        hops = 1;

        updateStats();


        await pulse(
            "switch",
            "ring-active"
        );


        /*
           SWITCH
           ↓
           SERVER
        */

        activateLine(
            "switch",
            "server",
            "ring-active"
        );


        await movePacket(
            "server",
            950
        );


        hops = 2;

        updateStats();


        await pulse(
            "server",
            "receive"
        );


        log(
            "RING: Server menerima data."
        );


        /*
           Efek mengelilingi ring
        */

        const ringNodes = [
            "ap",
            "pc2",
            "pc1",
            "router"
        ];


        for (
            const id of ringNodes
        ) {

            device[id]
                .classList
                .add(
                    "ring-active"
                );


            await sleep(150);


            device[id]
                .classList
                .remove(
                    "ring-active"
                );

        }

    }


    /* =====================================================
       SEND DATA
    ===================================================== */

    async function sendData() {

        if (running) {

            return;

        }


        running = true;

        sendBtn.disabled = true;


        clearDevices();


        packet.style.display =
            "block";


        packets++;


        hops = 0;


        packetStatusEl.textContent =
            "TRANSMITTING";


        logStatus.textContent =
            "TRANSMITTING";


        latencyEl.textContent =
            Math.floor(
                15 +
                Math.random() * 25
            )
            +
            " ms";


        updateStats();


        /*
           Pastikan posisi sudah benar
        */

        applyPositions();


        await sleep(100);


        const start =
            getPosition("router");


        packet.style.left =
            start.x + "px";

        packet.style.top =
            start.y + "px";


        device.router
            .classList
            .add("active");


        await sleep(300);


        device.router
            .classList
            .remove("active");


        try {

            if (
                topology === "star"
            ) {

                await animateStar();

            }


            else if (
                topology === "tree"
            ) {

                await animateTree();

            }


            else if (
                topology === "bus"
            ) {

                await animateBus();

            }


            else if (
                topology === "ring"
            ) {

                await animateRing();

            }

        }

        catch (error) {

            console.error(
                error
            );

            log(
                "ERROR: " +
                error.message
            );

        }


        await sleep(300);


        packet.style.display =
            "none";


        clearDevices();


        svg
            .querySelectorAll(
                ".connection"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "active",
                        "ring-active"
                    );

                }
            );


        packetStatusEl.textContent =
            "DELIVERED";


        logStatus.textContent =
            "DELIVERED";


        running = false;

        sendBtn.disabled = false;

    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetSimulation() {

        if (running) {

            return;

        }


        packets = 0;

        hops = 0;


        packet.style.display =
            "none";


        clearDevices();


        busLine.classList.remove(
            "active"
        );


        svg
            .querySelectorAll(
                ".connection"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "active",
                        "ring-active"
                    );

                }
            );


        packetStatusEl.textContent =
            "IDLE";


        logStatus.textContent =
            "READY";


        latencyEl.textContent =
            "0 ms";


        updateStats();


        drawTopology();


        log(
            "Simulation di-reset."
        );

    }


    /* =====================================================
       UPDATE STATS
    ===================================================== */

    function updateStats() {

        packetCountEl.textContent =
            packets;

        hopCountEl.textContent =
            hops;

    }


    /* =====================================================
       CHANGE TOPOLOGY
    ===================================================== */

    function changeTopology(
        newTopology
    ) {

        if (running) {

            return;

        }


        topology =
            newTopology;


        const info =
            data[topology];


        pageTitle.textContent =
            info.title;


        pageDescription.textContent =
            info.description;


        currentMode.textContent =
            info.title;


        /*
           Tombol aktif
        */

        document
            .querySelectorAll(
                ".topology-btn"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.topology ===
                        topology
                    );

                }
            );


        packetStatusEl.textContent =
            "IDLE";


        latencyEl.textContent =
            "0 ms";


        clearDevices();


        drawTopology();


        log(
            "Topology berubah menjadi " +
            info.title
        );

    }


    /* =====================================================
       TOPOLOGY BUTTON
    ===================================================== */

    const topologyButtons =
        document.querySelectorAll(
            ".topology-btn"
        );


    topologyButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const selected =
                        this.dataset.topology;


                    changeTopology(
                        selected
                    );

                }
            );

        }
    );


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    sendBtn.addEventListener(
        "click",
        function () {

            sendData();

        }
    );


    /* =====================================================
       RESET BUTTON
    ===================================================== */

    resetBtn.addEventListener(
        "click",
        function () {

            resetSimulation();

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            if (!running) {

                drawTopology();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        applyPositions();

        drawTopology();

        updateStats();

        log(
            "Network simulator siap."
        );

        console.log(
            "Network Topology Simulator aktif."
        );

    }


    initialize();

});
