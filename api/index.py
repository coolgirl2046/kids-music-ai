import os

from flask import Flask, jsonify, request
from openai import OpenAI


# =========================
# Flask 앱
# Vercel Python 진입점
# =========================

app = Flask(__name__)


# =========================
# OpenAI 클라이언트
#
# API Key는 코드에 직접 작성하지 않고
# Vercel의 환경 변수에서 가져옵니다.
# =========================

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    timeout=40.0,
    max_retries=1
)


# =========================
# AI 수업안 생성 API
# =========================

@app.route("/api/generate", methods=["POST"])
def generate_lesson():

    try:

        # =========================
        # 1. 사용자 입력 받기
        # =========================

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "입력값을 확인해 주세요"
            }), 400


        # =========================
        # 2. 기본 입력값
        # =========================

        age = str(
            data.get("age", "")
        ).strip()

        lesson_time = str(
            data.get("lessonTime", "")
        ).strip()

        theme = str(
            data.get("theme", "")
        ).strip()

        difficulty = str(
            data.get("difficulty", "")
        ).strip()

        classical_music = str(
            data.get("classicalMusic", "")
        ).strip()


        # =========================
        # 3. 여러 개 선택 가능한 값
        # =========================

        music_concepts = data.get(
            "musicConcepts",
            []
        )

        activity_types = data.get(
            "activityTypes",
            []
        )

        teaching_methods = data.get(
            "teachingMethods",
            []
        )


        # =========================
        # 4. 추가 입력값
        # =========================

        music_concept_other = str(
            data.get(
                "musicConceptOther",
                ""
            )
        ).strip()

        activity_type_other = str(
            data.get(
                "activityTypeOther",
                ""
            )
        ).strip()

        classical_title = str(
            data.get(
                "classicalTitle",
                ""
            )
        ).strip()

        materials = str(
            data.get(
                "materials",
                ""
            )
        ).strip()

        extra_request = str(
            data.get(
                "request",
                ""
            )
        ).strip()


        # =========================
        # 5. 필수 입력 확인
        #
        # 과제 요구사항:
        # 빈 입력 실패 처리
        # =========================

        if not age:
            return jsonify({
                "error": "수업 연령을 선택해 주세요"
            }), 400

        if not lesson_time:
            return jsonify({
                "error": "수업 시간을 선택해 주세요"
            }), 400

        if not theme:
            return jsonify({
                "error": "수업 주제를 입력해 주세요"
            }), 400

        if not difficulty:
            return jsonify({
                "error": "수업 난이도를 선택해 주세요"
            }), 400

        if not classical_music:
            return jsonify({
                "error": "클래식 음악 선택 방식을 골라 주세요"
            }), 400


        # =========================
        # 6. 클래식 직접 입력 확인
        # =========================

        if (
            classical_music == "직접 입력"
            and not classical_title
        ):
            return jsonify({
                "error": "원하는 클래식 곡명을 입력해 주세요"
            }), 400


        # =========================
        # 7. 배열 데이터 안전하게 처리
        # =========================

        if not isinstance(
            music_concepts,
            list
        ):
            music_concepts = []

        if not isinstance(
            activity_types,
            list
        ):
            activity_types = []

        if not isinstance(
            teaching_methods,
            list
        ):
            teaching_methods = []


        # =========================
        # 8. 음악 개념 정리
        # =========================

        if music_concepts:
            music_concept_text = ", ".join(
                str(item)
                for item in music_concepts
            )
        else:
            music_concept_text = (
                "AI가 연령과 주제에 맞게 선택"
            )

        if music_concept_other:
            music_concept_text += (
                f", {music_concept_other}"
            )


        # =========================
        # 9. 활동 유형 정리
        # =========================

        if activity_types:
            activity_type_text = ", ".join(
                str(item)
                for item in activity_types
            )
        else:
            activity_type_text = (
                "AI가 적절한 활동을 제안"
            )

        if activity_type_other:
            activity_type_text += (
                f", {activity_type_other}"
            )


        # =========================
        # 10. 교육 접근법 정리
        # =========================

        if teaching_methods:
            teaching_method_text = ", ".join(
                str(item)
                for item in teaching_methods
            )
        else:
            teaching_method_text = (
                "특정 교수법 지정 없음"
            )


        # =========================
        # 11. 클래식 음악 조건
        # =========================

        if classical_music == "AI 추천":

            classical_instruction = """
수업 주제와 대상 연령,
활동 목적에 적합한 클래식 음악 1곡을 추천하세요.

작곡가와 작품명을 함께 제시하고,
수업에서 어떻게 활용할 수 있는지도 설명하세요.

작품명이나 작곡가가 확실하지 않은 경우
임의로 만들어내지 마세요.
"""

        else:

            classical_instruction = f"""
사용자가 선택한 클래식 음악
'{classical_title}'을 사용하세요.

다른 작품으로 변경하지 말고,
이 음악을 수업 활동에 어떻게 활용할지
구체적으로 설명하세요.
"""


        # =========================
        # 12. AI에게 전달할 프롬프트
        # =========================

        prompt = f"""
당신은 유아음악교육 수업을 설계하는 전문가입니다.

유치원, 어린이집 교사와 유아음악 강사가
실제 현장에서 바로 사용할 수 있도록
아래 조건에 맞는 유아음악 수업안을 작성해 주세요.


[수업 조건]

대상 연령: {age}

수업 시간: {lesson_time}

수업 주제: {theme}

음악 개념:
{music_concept_text}

활동 유형:
{activity_type_text}

교육 접근법:
{teaching_method_text}

수업 난이도:
{difficulty}

사용할 악기 또는 교구:
{materials if materials else "AI가 적절하게 제안"}

추가 요청:
{extra_request if extra_request else "없음"}


[클래식 음악]

{classical_instruction}


[수업안 작성 원칙]

1. 대상 연령의 발달 수준에 맞게 구성하세요.

2. 전체 활동이 {lesson_time} 안에
실제로 진행될 수 있도록 시간을 배분하세요.

3. 오르프, 달크로즈, 유리드믹스 등
사용자가 선택한 교육 접근법이 있다면
이름만 적지 말고 실제 활동에 반영하세요.

4. 교사가 바로 따라 할 수 있을 정도로
활동 방법을 구체적으로 설명하세요.

5. 악기와 교구는
현장에서 준비하기 쉬운 수준으로 구성하세요.

6. 클래식 음악을 추천할 경우
확실하지 않은 작곡가나 작품명을
임의로 만들지 마세요.

7. 유아 활동에 안전상 주의점이 있다면
교사 진행 팁에 포함하세요.

8. 수업 흐름은
도입 → 전개 → 마무리 순서로
자연스럽게 연결하세요.

9. 전개 활동은
듣기 → 움직이기 → 표현하기 → 연주하기처럼
음악 경험이 확장되도록 구성하세요.

10. 한국어로 자연스럽고
현장 교사가 읽기 쉽게 작성하세요.


[출력 형식]

아래 순서를 유지하세요.

1. 수업 제목

2. 대상 연령

3. 수업 시간

4. 수업 목표
- 2~3개

5. 핵심 음악 개념

6. 준비물

7. 활용 클래식 음악
- 작곡가
- 작품명
- 수업 활용 이유

8. 도입
- 예상 시간
- 교사 진행 방법
- 유아 활동

9. 전개 활동 1
- 예상 시간
- 활동 방법
- 음악교육적 의미

10. 전개 활동 2
- 예상 시간
- 활동 방법
- 음악교육적 의미

11. 마무리
- 예상 시간
- 활동 방법

12. 교사 진행 팁
- 연령별 난이도 조절
- 안전 또는 운영상 주의점

13. 확장 활동
- 다음 활동으로 연결할 수 있는 아이디어 1개


불필요하게 같은 설명을 반복하지 말고,
실제 수업에서 바로 사용할 수 있는
구체적인 수업안을 작성하세요.
"""


        # =========================
        # 13. OpenAI API 호출
        # =========================

        response = client.responses.create(
            model="gpt-5.5",
            input=prompt
        )


        # =========================
        # 14. AI 결과 확인
        # =========================

        result = response.output_text

        if not result:
            return jsonify({
                "error": (
                    "AI 결과를 생성하지 못했습니다. "
                    "잠시 후 다시 시도해 주세요"
                )
            }), 500


        # =========================
        # 15. 프론트엔드로 결과 반환
        # =========================

        return jsonify({
            "result": result.strip()
        })


    # =========================
    # 16. API 오류 처리
    #
    # 과제 요구사항:
    # API 오류 안내
    # =========================

    except Exception as error:

        print(
            "AI API ERROR:",
            str(error)
        )

        return jsonify({
            "error": (
                "AI 수업안 생성 중 오류가 발생했습니다. "
                "잠시 후 다시 시도해 주세요"
            )
        }), 500