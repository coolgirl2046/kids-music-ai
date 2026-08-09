document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lesson-form");
    const generateButton = document.getElementById("generate-button");
    const generateButtonText = document.getElementById("generate-button-text");

    const loadingMessage = document.getElementById("loading-message");
    const loadingDetail = document.getElementById("loading-detail");

    const errorMessage = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");

    const resultArea = document.getElementById("result-area");
    const lessonResult = document.getElementById("lesson-result");
    const retryButton = document.getElementById("retry-button");

    const classicalMusic = document.getElementById("classical-music");
    const classicalTitle = document.getElementById("classical-title");

    if (!form || !generateButton || !loadingMessage || !resultArea || !lessonResult) {
        console.error("필수 요소를 찾을 수 없습니다");
        return;
    }


    /* =========================
       클래식 음악 선택 상태
    ========================= */

    const updateClassicalTitleState = () => {
        if (!classicalMusic || !classicalTitle) {
            return;
        }

        if (classicalMusic.value === "직접 입력") {
            classicalTitle.disabled = false;
            classicalTitle.placeholder = "원하는 클래식 곡명을 입력하세요";
        } else {
            classicalTitle.disabled = true;
            classicalTitle.value = "";
            classicalTitle.placeholder =
                "직접 입력을 선택한 경우 곡명을 작성하세요";
        }
    };


    if (classicalMusic) {
        classicalMusic.addEventListener(
            "change",
            updateClassicalTitleState
        );

        updateClassicalTitleState();
    }


    /* =========================
       값 가져오기
    ========================= */

    const getValue = (id) => {
        const element = document.getElementById(id);

        if (!element) {
            return "";
        }

        return element.value.trim();
    };


    const getCheckedValues = (name) => {
        return Array.from(
            form.querySelectorAll(`input[name="${name}"]:checked`)
        ).map((input) => input.value);
    };


    /* =========================
       오류 표시
    ========================= */

    const showError = (message) => {
        if (errorText) {
            errorText.textContent = message;
        }

        if (errorMessage) {
            errorMessage.hidden = false;

            errorMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    };


    const clearError = () => {
        if (errorMessage) {
            errorMessage.hidden = true;
        }

        if (errorText) {
            errorText.textContent = "";
        }
    };


    /* =========================
       로딩 상태
       보너스 미션 유지
    ========================= */

    let loadingTimer = null;

    const startLoading = () => {
        clearError();

        loadingMessage.hidden = false;
        resultArea.hidden = true;

        generateButton.disabled = true;
        generateButton.setAttribute("aria-busy", "true");

        if (generateButtonText) {
            generateButtonText.textContent =
                "AI가 수업안을 만드는 중";
        }

        if (loadingDetail) {
            loadingDetail.textContent =
                "수업 조건을 분석하고 음악 활동을 구성하고 있어요";
        }


        let seconds = 0;

        loadingTimer = setInterval(() => {
            seconds += 1;

            if (!loadingDetail) {
                return;
            }

            if (seconds < 10) {
                loadingDetail.textContent =
                    "수업 조건을 분석하고 음악 활동을 구성하고 있어요";
            } else if (seconds < 25) {
                loadingDetail.textContent =
                    "연령에 맞는 활동 순서를 설계하고 있어요";
            } else if (seconds < 40) {
                loadingDetail.textContent =
                    "클래식 음악과 음악교육 방법을 연결하고 있어요";
            } else {
                loadingDetail.textContent =
                    "조금만 더 기다려 주세요. 완성된 수업안을 준비하고 있어요";
            }
        }, 1000);


        loadingMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    };


    const stopLoading = () => {
        if (loadingTimer) {
            clearInterval(loadingTimer);
            loadingTimer = null;
        }

        loadingMessage.hidden = true;

        generateButton.disabled = false;
        generateButton.removeAttribute("aria-busy");

        if (generateButtonText) {
            generateButtonText.textContent =
                "AI 수업안 생성하기";
        }
    };


    /* =========================
       결과 정리
    ========================= */

    const normalizeResult = (result) => {
        if (typeof result !== "string") {
            return String(result ?? "");
        }

        return result
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\n{4,}/g, "\n\n\n")
            .trim();
    };


    const extractResult = (data) => {
        if (!data) {
            return "";
        }

        if (typeof data === "string") {
            return data;
        }

        if (typeof data.result === "string") {
            return data.result;
        }

        if (typeof data.lessonPlan === "string") {
            return data.lessonPlan;
        }

        if (typeof data.lesson_plan === "string") {
            return data.lesson_plan;
        }

        if (typeof data.content === "string") {
            return data.content;
        }

        if (typeof data.output === "string") {
            return data.output;
        }

        if (typeof data.text === "string") {
            return data.text;
        }

        if (data.data) {
            return extractResult(data.data);
        }

        return "";
    };


    const showResult = (result) => {
        lessonResult.textContent = result;

        resultArea.hidden = false;

        resultArea.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };


    /* =========================
       입력 데이터 수집
       백엔드 generate.py와 이름을 맞춤
    ========================= */

    const collectFormData = () => {
        return {
            age: getValue("age"),

            lessonTime: getValue("lesson-time"),

            theme: getValue("theme"),

            musicConcepts: getCheckedValues("musicConcept"),

            activityTypes: getCheckedValues("activityType"),

            teachingMethods: getCheckedValues("teachingMethod"),

            musicConceptOther: getValue(
                "music-concept-other"
            ),

            activityTypeOther: getValue(
                "activity-type-other"
            ),

            difficulty: getValue("difficulty"),

            classicalMusic: getValue(
                "classical-music"
            ),

            classicalTitle: getValue(
                "classical-title"
            ),

            materials: getValue("materials"),

            request: getValue("request")
        };
    };


    /* =========================
       필수 입력 확인
    ========================= */

    const validateFormData = (data) => {

        if (!data.age) {
            return "수업 연령을 선택해 주세요";
        }


        if (!data.lessonTime) {
            return "수업 시간을 선택해 주세요";
        }


        if (!data.theme) {
            return "수업 주제를 입력해 주세요";
        }


        if (!data.difficulty) {
            return "수업 난이도를 선택해 주세요";
        }


        if (!data.classicalMusic) {
            return "클래식 음악 선택 방식을 골라 주세요";
        }


        if (
            data.classicalMusic === "직접 입력" &&
            !data.classicalTitle
        ) {
            return "원하는 클래식 곡명을 입력해 주세요";
        }


        return "";
    };


    /* =========================
       API 요청
       최대 60초
    ========================= */

    const requestLessonPlan = async (data) => {

        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 60000);


        try {

            const response = await fetch(
                "/api/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(data),

                    signal: controller.signal
                }
            );


            let responseData;


            try {

                responseData = await response.json();

            } catch (error) {

                throw new Error(
                    "서버에서 올바른 결과를 받지 못했습니다"
                );
            }


            if (!response.ok) {

                throw new Error(
                    responseData?.error ||
                    responseData?.message ||
                    `서버 오류가 발생했습니다 (${response.status})`
                );
            }


            return responseData;

        } finally {

            clearTimeout(timeoutId);

        }
    };


    /* =========================
       폼 제출
    ========================= */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearError();

            const formData = collectFormData();

            const validationMessage =
                validateFormData(formData);


            if (validationMessage) {

                showError(validationMessage);

                return;
            }


            lessonResult.textContent = "";

            resultArea.hidden = true;


            /* 로딩 박스 표시 */

            startLoading();


            try {

                const responseData =
                    await requestLessonPlan(formData);


                const result =
                    normalizeResult(
                        extractResult(responseData)
                    );


                if (!result) {

                    throw new Error(
                        "AI가 수업안을 생성했지만 결과 내용이 없습니다"
                    );
                }


                stopLoading();

                showResult(result);


            } catch (error) {

                stopLoading();

                console.error(
                    "수업안 생성 오류:",
                    error
                );


                if (error.name === "AbortError") {

                    showError(
                        "AI 수업안 생성에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요"
                    );

                    return;
                }


                showError(
                    error.message ||
                    "수업안을 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요"
                );


            } finally {

                generateButton.disabled = false;

            }

        }
    );


    /* =========================
       다시 만들기
    ========================= */

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                resultArea.hidden = true;

                lessonResult.textContent = "";

                clearError();

                window.scrollTo({
                    top: document.getElementById(
                        "generator"
                    ).offsetTop - 80,

                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================
       버튼 마이크로 인터랙션
       보너스 미션 유지
    ========================= */

    generateButton.addEventListener(
        "mouseenter",
        () => {

            if (!generateButton.disabled) {

                generateButton.style.transform =
                    "translateY(-2px)";

            }

        }
    );


    generateButton.addEventListener(
        "mouseleave",
        () => {

            if (!generateButton.disabled) {

                generateButton.style.transform = "";

            }

        }
    );


    /* =========================
       Enter 키 처리
    ========================= */

    form.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                event.target.tagName !== "TEXTAREA"
            ) {

                event.preventDefault();

            }

        }
    );

});