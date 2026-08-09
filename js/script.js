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


let loadingTimers = [];


/* =====================================================
   체크박스 값
===================================================== */

function getCheckedValues(name) {

    return Array.from(
        document.querySelectorAll(
            `input[name="${name}"]:checked`
        )
    ).map(
        (input) => input.value
    );
}


/* =====================================================
   오류 숨기기
===================================================== */

function hideError() {

    errorMessage.hidden = true;
    errorText.textContent = "";
}


/* =====================================================
   오류 표시
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
   결과 숨기기
===================================================== */

function hideResult() {

    resultArea.hidden = true;
    lessonResult.textContent = "";
}


/* =====================================================
   로딩 타이머 정리
===================================================== */

function clearLoadingTimers() {

    loadingTimers.forEach(
        (timer) => clearTimeout(timer)
    );

    loadingTimers = [];
}


/* =====================================================
   로딩 시작
===================================================== */

function startLoading() {

    hideError();
    hideResult();

    clearLoadingTimers();

    loadingMessage.hidden = false;

    generateButton.disabled = true;

    generateButtonText.textContent =
        "AI 수업안 생성 중...";


    /* 처음 */

    loadingDetail.textContent =
        "연령과 수업 조건을 분석하고 있어요";


    /* 15초 */

    loadingTimers.push(
        setTimeout(() => {

            loadingDetail.textContent =
                "음악 개념과 활동 흐름을 구성하고 있어요";

        }, 15000)
    );


    /* 30초 */

    loadingTimers.push(
        setTimeout(() => {

            loadingDetail.textContent =
                "클래식 음악과 교수법을 반영하고 있어요";

        }, 30000)
    );


    /* 50초 */

    loadingTimers.push(
        setTimeout(() => {

            loadingDetail.textContent =
                "도입부터 마무리까지 완성된 교안을 작성하고 있어요";

        }, 50000)
    );


    /* 80초 */

    loadingTimers.push(
        setTimeout(() => {

            loadingDetail.textContent =
                "완성도 높은 교안을 만드는 데 시간이 조금 걸릴 수 있어요";

        }, 80000)
    );


    /* 120초 */

    loadingTimers.push(
        setTimeout(() => {

            loadingDetail.textContent =
                "AI가 수업안을 계속 작성하고 있습니다. 잠시만 기다려 주세요";

        }, 120000)
    );


    loadingMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =====================================================
   로딩 종료
===================================================== */

function stopLoading() {

    clearLoadingTimers();

    loadingMessage.hidden = true;

    generateButton.disabled = false;

    generateButtonText.textContent =
        "AI 수업안 생성하기";
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
   클래식 직접 입력
===================================================== */

function updateClassicalInput() {

    const selectedValue =
        classicalMusicSelect.value;


    if (selectedValue === "직접 입력") {

        classicalTitleInput.disabled = false;

        classicalTitleInput.placeholder =
            "예: 생상스 동물의 사육제 중 백조";

        classicalTitleGroup.classList.add(
            "is-active"
        );

    } else {

        classicalTitleInput.value = "";

        classicalTitleInput.disabled = true;

        classicalTitleInput.placeholder =
            "직접 입력을 선택하면 곡명을 작성할 수 있습니다";

        classicalTitleGroup.classList.remove(
            "is-active"
        );
    }
}


/* =====================================================
   폼 제출
===================================================== */

lessonForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideError();
        hideResult();


        /* =============================================
           입력값
        ============================================= */

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

        const requestText =
            document.querySelector(
                "#request"
            ).value.trim();

        const musicConceptOther =
            document.querySelector(
                "#music-concept-other"
            ).value.trim();

        const activityTypeOther =
            document.querySelector(
                "#activity-type-other"
            ).value.trim();


        const musicConcepts =
            getCheckedValues(
                "musicConcept"
            );

        const activityTypes =
            getCheckedValues(
                "activityType"
            );

        const teachingMethods =
            getCheckedValues(
                "teachingMethod"
            );


        /* =============================================
           필수값 검증
        ============================================= */

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


        if (
            classicalMusic === "직접 입력" &&
            !classicalTitle
        ) {

            showError(
                "원하는 클래식 곡명을 입력해 주세요"
            );

            return;
        }


        /* =============================================
           서버 전송 데이터
        ============================================= */

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


        /* =============================================
           로딩 시작
        ============================================= */

        startLoading();


        /* =============================================
           프런트 최대 대기시간

           서버의 AI 요청 및 자동 재시도 시간을
           충분히 확보하기 위해 240초 대기
        ============================================= */

        const controller =
            new AbortController();


        const timeoutId =
            setTimeout(
                () => {

                    controller.abort();

                },
                240000
            );


        try {

            /* =========================================
               Python API 호출
            ========================================= */

            const response =
                await fetch(
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


            /* =========================================
               JSON 응답
            ========================================= */

            let data;


            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "서버 응답을 읽을 수 없습니다"
                );
            }


            /* =========================================
               HTTP 오류
            ========================================= */

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    `서버 오류가 발생했습니다 (${response.status})`
                );
            }


            /* =========================================
               결과 검증
            ========================================= */

            if (
                !data.result ||
                typeof data.result !== "string" ||
                !data.result.trim()
            ) {

                throw new Error(
                    "생성된 수업안이 없습니다"
                );
            }


            /* =========================================
               정상 결과
            ========================================= */

            showResult(
                data.result.trim()
            );


        } catch (error) {

            console.error(
                "AI 수업안 생성 오류:",
                error
            );


            if (
                error.name ===
                "AbortError"
            ) {

                showError(
                    "AI 수업안 생성 시간이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요"
                );

            } else {

                showError(
                    error.message ||
                    "AI 수업안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요"
                );
            }


        } finally {

            clearTimeout(
                timeoutId
            );

            stopLoading();
        }

    }
);


/* =====================================================
   다시 만들기
===================================================== */

retryButton.addEventListener(
    "click",
    () => {

        hideError();
        hideResult();

        document
            .querySelector(
                "#generator"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }
);


/* =====================================================
   클래식 선택 변경
===================================================== */

classicalMusicSelect.addEventListener(
    "change",
    updateClassicalInput
);


/* =====================================================
   초기 상태
===================================================== */

updateClassicalInput();

hideError();

hideResult();

stopLoading();