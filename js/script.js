const lessonForm = document.querySelector("#lesson-form");

const loadingMessage = document.querySelector("#loading-message");
const loadingDetail = document.querySelector("#loading-detail");

const errorMessage = document.querySelector("#error-message");
const errorText = document.querySelector("#error-text");

const resultArea = document.querySelector("#result-area");
const lessonResult = document.querySelector("#lesson-result");

const generateButton = document.querySelector("#generate-button");
const generateButtonText = document.querySelector("#generate-button-text");

const retryButton = document.querySelector("#retry-button");

const classicalMusicSelect = document.querySelector("#classical-music");
const classicalTitleInput = document.querySelector("#classical-title");
const classicalTitleGroup = document.querySelector("#classical-title-group");


let loadingTimer = null;


/* =====================================================
   체크박스 값 가져오기
===================================================== */

function getCheckedValues(name) {
    return Array.from(
        document.querySelectorAll(`input[name="${name}"]:checked`)
    ).map((input) => input.value);
}


/* =====================================================
   오류 메시지 초기화
===================================================== */

function hideError() {
    errorMessage.hidden = true;
    errorText.textContent = "";
}


/* =====================================================
   오류 메시지 표시
===================================================== */

function showError(message) {
    loadingMessage.hidden = true;
    resultArea.hidden = true;

    errorText.textContent = message;
    errorMessage.hidden = false;

    errorMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =====================================================
   결과 초기화
===================================================== */

function hideResult() {
    resultArea.hidden = true;
    lessonResult.textContent = "";
}


/* =====================================================
   로딩 시작
===================================================== */

function startLoading() {
    hideError();
    hideResult();

    loadingMessage.hidden = false;

    generateButton.disabled = true;
    generateButtonText.textContent = "AI 수업안 생성 중...";

    const loadingSteps = [
        "연령과 수업 조건을 분석하고 있어요",
        "음악 개념과 활동 유형을 연결하고 있어요",
        "클래식 음악과 교수법을 반영하고 있어요",
        "도입부터 마무리까지 수업 흐름을 정리하고 있어요"
    ];

    let index = 0;

    loadingDetail.textContent = loadingSteps[index];

    loadingTimer = setInterval(() => {
        index = (index + 1) % loadingSteps.length;
        loadingDetail.textContent = loadingSteps[index];
    }, 2200);

    loadingMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =====================================================
   로딩 종료
===================================================== */

function stopLoading() {
    loadingMessage.hidden = true;

    generateButton.disabled = false;
    generateButtonText.textContent = "AI 수업안 생성하기";

    if (loadingTimer) {
        clearInterval(loadingTimer);
        loadingTimer = null;
    }
}


/* =====================================================
   결과 표시
===================================================== */

function showResult(result) {
    lessonResult.textContent = result;

    resultArea.hidden = false;

    resultArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   클래식 직접 입력 상태
===================================================== */

function updateClassicalInput() {
    const selectedValue = classicalMusicSelect.value;

    if (selectedValue === "직접 입력") {
        classicalTitleInput.disabled = false;

        classicalTitleInput.placeholder =
            "예: 생상스 동물의 사육제 중 백조";

        classicalTitleGroup.classList.add("is-active");
    } else {
        classicalTitleInput.value = "";
        classicalTitleInput.disabled = true;

        classicalTitleInput.placeholder =
            "직접 입력을 선택하면 곡명을 작성할 수 있습니다";

        classicalTitleGroup.classList.remove("is-active");
    }
}


/* =====================================================
   폼 제출
===================================================== */

lessonForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideError();
    hideResult();


    /* =========================
       입력값
    ========================== */

    const age = document.querySelector("#age").value;

    const lessonTime =
        document.querySelector("#lesson-time").value;

    const theme =
        document.querySelector("#theme").value.trim();

    const difficulty =
        document.querySelector("#difficulty").value;

    const classicalMusic =
        document.querySelector("#classical-music").value;

    const classicalTitle =
        document.querySelector("#classical-title").value.trim();

    const materials =
        document.querySelector("#materials").value.trim();

    const requestText =
        document.querySelector("#request").value.trim();

    const musicConceptOther =
        document.querySelector("#music-concept-other").value.trim();

    const activityTypeOther =
        document.querySelector("#activity-type-other").value.trim();


    const musicConcepts =
        getCheckedValues("musicConcept");

    const activityTypes =
        getCheckedValues("activityType");

    const teachingMethods =
        getCheckedValues("teachingMethod");


    /* =========================
       필수값 검증
    ========================== */

    if (!age) {
        showError("수업 연령을 선택해 주세요");
        return;
    }

    if (!lessonTime) {
        showError("수업 시간을 선택해 주세요");
        return;
    }

    if (!theme) {
        showError("수업 주제를 입력해 주세요");
        return;
    }

    if (!difficulty) {
        showError("수업 난이도를 선택해 주세요");
        return;
    }

    if (!classicalMusic) {
        showError("클래식 음악 선택 방식을 골라 주세요");
        return;
    }

    if (
        classicalMusic === "직접 입력" &&
        !classicalTitle
    ) {
        showError("원하는 클래식 곡명을 입력해 주세요");
        return;
    }


    /* =========================
       서버에 보낼 데이터
    ========================== */

    const lessonData = {
        age,
        lessonTime,
        theme,

        musicConcepts,
        musicConceptOther,

        activityTypes,
        activityTypeOther,

        teachingMethods,

        difficulty,

        classicalMusic,
        classicalTitle,

        materials,

        request: requestText
    };


    /* =========================
       로딩 시작
    ========================== */

    startLoading();


    /* =========================
       45초 타임아웃
    ========================== */

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 45000);


    try {

        /* =========================
           Python API 호출
        ========================== */

        const response = await fetch(
            "/api/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(lessonData),

                signal: controller.signal
            }
        );


        /* =========================
           JSON 응답
        ========================== */

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "서버 응답을 읽을 수 없습니다"
            );
        }


        /* =========================
           HTTP 오류
        ========================== */

        if (!response.ok) {
            throw new Error(
                data.error ||
                `서버 오류가 발생했습니다 (${response.status})`
            );
        }


        /* =========================
           결과 확인
        ========================== */

        if (
            !data.result ||
            typeof data.result !== "string" ||
            !data.result.trim()
        ) {
            throw new Error(
                "생성된 수업안이 없습니다"
            );
        }


        /* =========================
           정상 결과 출력
        ========================== */

        showResult(
            data.result.trim()
        );

    } catch (error) {

        console.error(
            "AI 수업안 생성 오류:",
            error
        );


        if (error.name === "AbortError") {

            showError(
                "AI 응답이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요"
            );

        } else {

            showError(
                error.message ||
                "AI 수업안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요"
            );

        }

    } finally {

        clearTimeout(timeoutId);

        stopLoading();
    }

});


/* =====================================================
   다시 만들기
===================================================== */

retryButton.addEventListener("click", () => {

    hideError();
    hideResult();

    document
        .querySelector("#generator")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

});


/* =====================================================
   클래식 선택 변경
===================================================== */

classicalMusicSelect.addEventListener(
    "change",
    updateClassicalInput
);


/* =====================================================
   첫 화면 상태
===================================================== */

updateClassicalInput();
hideError();
hideResult();
stopLoading();