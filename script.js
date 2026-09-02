const svg = document.getElementById("ganpati");

const drawBtn =
    document.getElementById("drawBtn");

const recordBtn =
    document.getElementById("recordBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const status =
    document.getElementById("status");


let paths = [];

let recorder = null;

let recordedChunks = [];

let videoURL = null;


/* =====================================================
   FIND ALL DRAWING ELEMENTS
===================================================== */

function prepareDrawing() {

    paths =
        svg.querySelectorAll(
            ".drawing path, .drawing circle"
        );

    paths.forEach(element => {

        if (
            element.tagName.toLowerCase()
            === "path"
        ) {

            const length =
                element.getTotalLength();

            element.style.strokeDasharray =
                length;

            element.style.strokeDashoffset =
                length;

            element.style.fill =
                "none";

            element.dataset.length =
                length;

        }

        else {

            const r =
                parseFloat(
                    element.getAttribute("r")
                );

            const circumference =
                2 * Math.PI * r;

            element.style.strokeDasharray =
                circumference;

            element.style.strokeDashoffset =
                circumference;

            element.dataset.length =
                circumference;
        }

    });
}


/* =====================================================
   RESET
===================================================== */

function resetDrawing() {

    paths.forEach(element => {

        const length =
            parseFloat(
                element.dataset.length
            );

        element.style.strokeDashoffset =
            length;

    });
}


/* =====================================================
   SHOW COMPLETE DRAWING
===================================================== */

function showComplete() {

    paths.forEach(element => {

        element.style.strokeDashoffset =
            0;

    });
}


/* =====================================================
   DRAW ANIMATION
===================================================== */

function drawGanpati(callback) {

    resetDrawing();

    status.textContent =
        "✏️ Drawing Ganpati...";


    const start =
        performance.now();

    const duration =
        12000;


    function animate(time) {

        let progress =
            (time - start) / duration;


        progress =
            Math.min(progress, 1);


        /*
            Ease-out effect
        */

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        /*
            Draw each path one after another
        */

        paths.forEach(
            (element, index) => {

                const length =
                    parseFloat(
                        element.dataset.length
                    );


                const startPoint =
                    index /
                    paths.length;

                const endPoint =
                    (index + 1) /
                    paths.length;


                let localProgress =
                    (eased - startPoint) /
                    (endPoint - startPoint);


                localProgress =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            localProgress
                        )
                    );


                const offset =
                    length *
                    (1 - localProgress);


                element.style.strokeDashoffset =
                    offset;

            }
        );


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

            showComplete();

            status.textContent =
                "✨ Ganpati Bappa Morya! Drawing Complete 🙏";


            if (callback) {

                callback();

            }

        }

    }


    requestAnimationFrame(
        animate
    );
}


/* =====================================================
   DRAW BUTTON
===================================================== */

drawBtn.addEventListener(
    "click",
    () => {

        drawGanpati();

    }
);


/* =====================================================
   RECORD VIDEO
===================================================== */

recordBtn.addEventListener(
    "click",
    () => {

        /*
            Check browser support
        */

        if (
            !svg ||
            !svg.captureStream
        ) {

            /*
               SVG itself doesn't support
               captureStream in most browsers.

               So use a canvas recorder.
            */

            recordSVGAnimation();

            return;

        }

    }
);


/* =====================================================
   SVG → CANVAS VIDEO RECORDING
===================================================== */

function recordSVGAnimation() {

    recordedChunks = [];

    status.textContent =
        "🔴 Preparing video...";


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width = 1200;

    canvas.height = 900;


    const ctx =
        canvas.getContext("2d");


    const stream =
        canvas.captureStream(30);


    let mimeType =
        "video/webm;codecs=vp9";


    if (
        !MediaRecorder
            .isTypeSupported(
                mimeType
            )
    ) {

        mimeType =
            "video/webm";
    }


    recorder =
        new MediaRecorder(
            stream,
            {
                mimeType:
                    mimeType,

                videoBitsPerSecond:
                    8000000
            }
        );


    recorder.ondataavailable =
        event => {

            if (
                event.data.size > 0
            ) {

                recordedChunks.push(
                    event.data
                );

            }

        };


    recorder.onstop =
        () => {

            const blob =
                new Blob(
                    recordedChunks,
                    {
                        type:
                            "video/webm"
                    }
                );


            videoURL =
                URL.createObjectURL(
                    blob
                );


            downloadBtn.disabled =
                false;


            status.textContent =
                "🎥 Video ready! Click Download Video.";

        };


    recorder.start();


    /*
       Draw SVG into canvas
    */

    const serializer =
        new XMLSerializer();


    const svgString =
        serializer.serializeToString(
            svg
        );


    const svgBlob =
        new Blob(
            [svgString],
            {
                type:
                    "image/svg+xml"
            }
        );


    const url =
        URL.createObjectURL(
            svgBlob
        );


    const img =
        new Image();


    img.onload = () => {

        const start =
            performance.now();


        const duration =
            12000;


        function renderVideo(
            currentTime
        ) {

            let progress =
                (currentTime - start) /
                duration;


            progress =
                Math.min(
                    progress,
                    1
                );


            /*
                Redraw the SVG
            */

            resetDrawing();


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            paths.forEach(
                (element, index) => {

                    const length =
                        parseFloat(
                            element.dataset.length
                        );


                    const startPoint =
                        index /
                        paths.length;


                    const endPoint =
                        (index + 1) /
                        paths.length;


                    let local =
                        (eased -
                            startPoint) /
                        (endPoint -
                            startPoint);


                    local =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                local
                            )
                        );


                    element.style
                        .strokeDashoffset =
                        length *
                        (1 - local);

                }
            );


            /*
                Serialize updated SVG
            */

            const updated =
                serializer
                    .serializeToString(
                        svg
                    );


            const blob =
                new Blob(
                    [updated],
                    {
                        type:
                            "image/svg+xml"
                    }
                );


            const imageURL =
                URL.createObjectURL(
                    blob
                );


            const frame =
                new Image();


            frame.onload = () => {

                ctx.fillStyle =
                    "#000";

                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                ctx.drawImage(
                    frame,
                    0,
                    0,
                    1200,
                    900
                );


                URL.revokeObjectURL(
                    imageURL
                );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        renderVideo
                    );

                } else {

                    setTimeout(
                        () => {

                            recorder.stop();

                            URL.revokeObjectURL(
                                url
                            );

                            status.textContent =
                                "🎥 Recording finished.";

                        },
                        500
                    );

                }

            };


            frame.src =
                imageURL;

        }


        requestAnimationFrame(
            renderVideo
        );

    };


    img.src =
        url;

}


/* =====================================================
   DOWNLOAD
===================================================== */

downloadBtn.addEventListener(
    "click",
    () => {

        if (!videoURL) {

            alert(
                "Please record the video first."
            );

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            videoURL;


        link.download =
            "Ganpati-Bappa-Drawing.webm";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

prepareDrawing();

resetDrawing();

downloadBtn.disabled =
    true;

status.textContent =
    "Ready — click Draw Ganpati 🙏";