const lessonForm = document.querySelector("#lesson-form");
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");
const resultArea = document.querySelector("#result-area");
const lessonResult = document.querySelector("#lesson-result");
const submitButton = document.querySelector("#generate-button");

let loadingTimer = null;


/* =========================
   체크된 항목 가져오기
========================== */

function getCheckedValues(name) {
    return Array.from(
        document.querySelectorAll(
            `input[name="${name}"]:checked`
        )
    ).map((input) => input.value);
}


/* =========================
   오류 메시지 표시
========================== */

function showError(message) {
    errorMessage.textContent = message;

    errorMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================
   오류 메시지 초기화
========================== */

function clearError() {
    errorMessage.textContent = "";
}


/* =========================
   로딩 시작
   보너스: 마이크로 인터랙션
========================== */

function startLoading() {
    loadingMessage.hidden = false;

    submitButton.disabled = true;
    submitButton.textContent = "♪ AI 수업안 생성 중...";

    const loadingTitle =
        loadingMessage.querySelector("strong");

    const loadingText =
        loadingMessage.querySelector("p");

    const messages = [
        {
            title: "AI가 수업안을 설계하고 있습니다",
            text: "연령과 수업 조건을 분석하고 있습니다"
        },
        {
            title: "음악 활동을 구성하고 있습니다",
            text: "주제와 음악 개념에 맞는 활동을 연결하고 있습니다"
        },
        {
            title: "수업 흐름을 정리하고 있습니다",
            text: "도입부터 마무리까지 실제 수업에 맞게 구성하고 있습니다"
        },
        {
            title: "클래식 음악을 검토하고 있습니다",
            text: "수업 주제와 활동에 어울리는 음악을 찾고 있습니다"
        }
    ];

    let index = 0;

    loadingTitle.textContent =
        messages[index].title;

    loadingText.textContent =
        messages[index].text;

    loadingTimer = setInterval(() => {
        index = (index + 1) % messages.length;

        loadingTitle.textContent =
            messages[index].title;

        loadingText.textContent =
            messages[index].text;
    }, 2200);
}


/* =========================
   로딩 종료
========================== */

function stopLoading() {
    loadingMessage.hidden = true;

    submitButton.disabled = false;
    submitButton.textContent =
        "♪ AI 수업안 생성하기";

    if (loadingTimer) {
        clearInterval(loadingTimer);
        loadingTimer = null;
    }
}


/* =========================
   결과 출력
========================== */

function showResult(result) {
    lessonResult.textContent = result;
    resultArea.hidden = false;

    resultArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================
   폼 제출
========================== */

lessonForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearError();

        resultArea.hidden = true;
        lessonResult.textContent = "";


        /* =========================
           입력값 수집
        ========================== */

        const age =
            document.querySelector("#age").value;

        const lessonTime =
            document.querySelector(
                "#lesson-time"
            ).value;

        const theme =
            document.querySelector(
                "#theme"
            ).value.trim();

        const musicConcepts =
            getCheckedValues(
                "musicConcept"
            );

        const musicConceptOther =
            document.querySelector(
                "#music-concept-other"
            ).value.trim();

        const activityTypes =
            getCheckedValues(
                "activityType"
            );

        const activityTypeOther =
            document.querySelector(
                "#activity-type-other"
            ).value.trim();

        const teachingMethods =
            getCheckedValues(
                "teachingMethod"
            );

        const difficulty =
            document.querySelector(
                "#difficulty"
            ).value;

        const classicalMusic =
            document.querySelector(
                "#classical-music"
            ).value;

        const classicalTitle =
            document.querySelector(
                "#classical-title"
            ).value.trim();

        const materials =
            document.querySelector(
                "#materials"
            ).value.trim();

        const request =
            document.querySelector(
                "#request"
            ).value.trim();


        /* =========================
           필수 입력 검증
           과제: 빈 입력 처리
        ========================== */

        if (!age) {
            showError(
                "수업 연령을 선택해 주세요"
            );
            return;
        }

        if (!lessonTime) {
            showError(
                "수업 시간을 선택해 주세요"
            );
            return;
        }

        if (!theme) {
            showError(
                "수업 주제를 입력해 주세요"
            );
            return;
        }

        if (!difficulty) {
            showError(
                "수업 난이도를 선택해 주세요"
            );
            return;
        }

        if (!classicalMusic) {
            showError(
                "클래식 음악 선택 방식을 골라 주세요"
            );
            return;
        }


        /* =========================
           클래식 직접 입력 검증
        ========================== */

        if (
            classicalMusic === "직접 입력" &&
            !classicalTitle
        ) {
            showError(
                "원하는 클래식 곡명을 입력해 주세요"
            );
            return;
        }


        /* =========================
           서버로 보낼 데이터
        ========================== */

        const lessonData = {
            age: age,
            lessonTime: lessonTime,
            theme: theme,

            musicConcepts:
                musicConcepts,

            musicConceptOther:
                musicConceptOther,

            activityTypes:
                activityTypes,

            activityTypeOther:
                activityTypeOther,

            teachingMethods:
                teachingMethods,

            difficulty:
                difficulty,

            classicalMusic:
                classicalMusic,

            classicalTitle:
                classicalTitle,

            materials:
                materials,

            request:
                request
        };


        /* =========================
           요청 시작
        ========================== */

        startLoading();


        /*
            과제 요구사항:
            응답 지연/타임아웃 처리

            45초가 지나면 요청을 중단합니다.
        */

        const controller =
            new AbortController();

        const timeoutId =
            setTimeout(() => {
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
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            lessonData
                        ),

                    signal:
                        controller.signal
                }
            );


            /* =========================
               응답 JSON 변환
            ========================== */

            let data;

            try {
                data =
                    await response.json();
            } catch {
                throw new Error(
                    "서버 응답을 확인할 수 없습니다"
                );
            }


            /* =========================
               API 오류 처리
               과제: 4xx / 5xx 대응
            ========================== */

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "AI 수업안을 생성하지 못했습니다"
                );
            }


            /* =========================
               결과값 검증
            ========================== */

            if (
                !data.result ||
                !data.result.trim()
            ) {
                throw new Error(
                    "생성된 수업안이 없습니다"
                );
            }


            /* =========================
               결과 표시
            ========================== */

            showResult(
                data.result
            );

        } catch (error) {

            console.error(
                "AI 요청 오류:",
                error
            );


            /* =========================
               타임아웃
            ========================== */

            if (
                error.name ===
                "AbortError"
            ) {
                showError(
                    "AI 응답이 예상보다 늦어지고 있습니다. 잠시 후 다시 시도해 주세요"
                );
            }

            /* =========================
               일반 API 오류
            ========================== */

            else {
                showError(
                    error.message ||
                    "AI 수업안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요"
                );
            }

        } finally {

            clearTimeout(timeoutId);

            stopLoading();
        }
    }
);


/* =========================
   클래식 음악 선택 UX
========================== */

const classicalMusicSelect =
    document.querySelector(
        "#classical-music"
    );

const classicalTitleInput =
    document.querySelector(
        "#classical-title"
    );


function updateClassicalInput() {

    if (
        classicalMusicSelect.value ===
        "직접 입력"
    ) {
        classicalTitleInput.disabled =
            false;

        classicalTitleInput.placeholder =
            "예: 생상스 동물의 사육제 중 백조";
    }

    else {
        classicalTitleInput.value = "";

        classicalTitleInput.disabled =
            true;

        classicalTitleInput.placeholder =
            "직접 입력을 선택하면 곡명을 작성할 수 있습니다";
    }
}


classicalMusicSelect.addEventListener(
    "change",
    updateClassicalInput
);


/* =========================
   첫 화면 상태 설정
========================== */

updateClassicalInput();