import json
import os

from http.server import BaseHTTPRequestHandler
from openai import OpenAI


# =====================================================
# OpenAI 설정
# API Key는 Vercel 환경 변수에서 가져옵니다
# =====================================================

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

OPENAI_MODEL = os.environ.get(
    "OPENAI_MODEL",
    "gpt-5.5"
)


# =====================================================
# JSON 응답 함수
# =====================================================

def make_json_response(handler, status_code, data):

    response_body = json.dumps(
        data,
        ensure_ascii=False
    ).encode("utf-8")

    handler.send_response(status_code)

    handler.send_header(
        "Content-Type",
        "application/json; charset=utf-8"
    )

    handler.send_header(
        "Content-Length",
        str(len(response_body))
    )

    handler.end_headers()

    handler.wfile.write(response_body)


# =====================================================
# 문자열 안전하게 가져오기
# =====================================================

def get_text(data, key):

    value = data.get(key, "")

    if value is None:
        return ""

    return str(value).strip()


# =====================================================
# 리스트 안전하게 가져오기
# =====================================================

def get_list(data, key):

    value = data.get(key, [])

    if not isinstance(value, list):
        return []

    return [
        str(item).strip()
        for item in value
        if str(item).strip()
    ]


# =====================================================
# Vercel Python Serverless Function
# /api/generate
# =====================================================

class handler(BaseHTTPRequestHandler):


    # -------------------------------------------------
    # POST 요청
    # -------------------------------------------------

    def do_POST(self):

        try:

            # =========================================
            # API Key 확인
            # =========================================

            if not OPENAI_API_KEY:

                make_json_response(
                    self,
                    500,
                    {
                        "error":
                        "AI 서비스 설정을 확인할 수 없습니다"
                    }
                )

                return


            # =========================================
            # 요청 본문 읽기
            # =========================================

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )


            if content_length <= 0:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "입력값을 확인해 주세요"
                    }
                )

                return


            raw_body = self.rfile.read(
                content_length
            )


            try:

                data = json.loads(
                    raw_body.decode("utf-8")
                )

            except json.JSONDecodeError:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "입력 데이터를 확인해 주세요"
                    }
                )

                return


            # =========================================
            # 기본 입력값
            # =========================================

            age = get_text(
                data,
                "age"
            )

            lesson_time = get_text(
                data,
                "lessonTime"
            )

            theme = get_text(
                data,
                "theme"
            )

            difficulty = get_text(
                data,
                "difficulty"
            )

            classical_music = get_text(
                data,
                "classicalMusic"
            )


            # =========================================
            # 선택 입력값
            # =========================================

            music_concepts = get_list(
                data,
                "musicConcepts"
            )

            activity_types = get_list(
                data,
                "activityTypes"
            )

            teaching_methods = get_list(
                data,
                "teachingMethods"
            )


            music_concept_other = get_text(
                data,
                "musicConceptOther"
            )

            activity_type_other = get_text(
                data,
                "activityTypeOther"
            )

            classical_title = get_text(
                data,
                "classicalTitle"
            )

            materials = get_text(
                data,
                "materials"
            )

            extra_request = get_text(
                data,
                "request"
            )


            # =========================================
            # 필수값 검증
            # =========================================

            if not age:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "수업 연령을 선택해 주세요"
                    }
                )

                return


            if not lesson_time:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "수업 시간을 선택해 주세요"
                    }
                )

                return


            if not theme:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "수업 주제를 입력해 주세요"
                    }
                )

                return


            if not difficulty:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "수업 난이도를 선택해 주세요"
                    }
                )

                return


            if not classical_music:

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "클래식 음악 선택 방식을 골라 주세요"
                    }
                )

                return


            if (
                classical_music == "직접 입력"
                and not classical_title
            ):

                make_json_response(
                    self,
                    400,
                    {
                        "error":
                        "원하는 클래식 곡명을 입력해 주세요"
                    }
                )

                return


            # =========================================
            # 음악 개념 정리
            # =========================================

            if music_concepts:

                music_concept_text = ", ".join(
                    music_concepts
                )

            else:

                music_concept_text = (
                    "AI가 연령과 주제에 맞게 선택"
                )


            if music_concept_other:

                music_concept_text += (
                    f", {music_concept_other}"
                )


            # =========================================
            # 활동 유형 정리
            # =========================================

            if activity_types:

                activity_type_text = ", ".join(
                    activity_types
                )

            else:

                activity_type_text = (
                    "AI가 적절한 활동을 제안"
                )


            if activity_type_other:

                activity_type_text += (
                    f", {activity_type_other}"
                )


            # =========================================
            # 교육 접근법 정리
            # =========================================

            if teaching_methods:

                teaching_method_text = ", ".join(
                    teaching_methods
                )

            else:

                teaching_method_text = (
                    "AI가 수업에 적절한 "
                    "음악교육 접근법을 선택"
                )


            # =========================================
            # 클래식 음악 조건
            # =========================================

            if classical_music == "AI 추천":

                classical_instruction = """
수업 주제와 대상 연령,
활동 목적에 어울리는 클래식 음악
1곡을 추천해 주세요.

작곡가와 정확한 작품명을 제시하고
해당 음악을 왜 선택했는지,
수업에서는 어떻게 활용하는지도
설명해 주세요.

확실하지 않은 작품이나 작곡가는
임의로 만들어내지 마세요.
"""

            else:

                classical_instruction = f"""
사용자가 선택한 클래식 음악
'{classical_title}'을 사용해 주세요.

다른 작품으로 바꾸지 말고
이 작품을 수업 활동에
어떻게 활용할지 설명해 주세요.
"""


            # =========================================
            # AI 프롬프트
            # =========================================

            prompt = f"""
당신은 유아음악교육을 전문으로 하는
음악교육 수업 설계 전문가입니다.

유치원, 어린이집 교사와
유아음악 강사가 실제 현장에서
바로 활용할 수 있는
구체적인 음악 수업안을 작성해 주세요.


[수업 기본 정보]

대상 연령:
{age}

전체 수업 시간:
{lesson_time}

수업 주제:
{theme}

수업 난이도:
{difficulty}


[음악 개념]

{music_concept_text}


[활동 유형]

{activity_type_text}


[음악교육 접근법]

{teaching_method_text}


[사용할 악기 또는 교구]

{materials if materials else "AI가 수업에 맞게 제안"}


[추가 요청]

{extra_request if extra_request else "특별한 추가 요청 없음"}


[클래식 음악]

{classical_instruction}


[수업 설계 원칙]

1.
대상 연령의 발달 수준을 고려해 주세요.

2.
전체 활동 시간이 반드시
{lesson_time} 안에 들어가도록
현실적으로 시간을 나누어 주세요.

3.
오르프, 달크로즈, 유리드믹스 등
선택된 음악교육 교수법을
단순히 이름만 적지 말고
실제 활동 과정에 반영해 주세요.

4.
오르프 접근법을 사용할 경우
말하기, 신체 리듬, 악기 연주,
즉흥 표현 등의 경험을
수업에 자연스럽게 연결해 주세요.

5.
달크로즈 또는 유리드믹스를 사용할 경우
음악을 듣고 움직이며
리듬, 빠르기, 셈여림 등을
신체로 경험하도록 구성해 주세요.

6.
단순히 활동 이름만 제시하지 말고
교사가 실제로 어떤 말을 하고
아이들이 무엇을 하는지
알 수 있도록 구체적으로 설명해 주세요.

7.
음악 경험이

듣기
→ 움직이기
→ 표현하기
→ 연주하기

처럼 자연스럽게 확장되도록
구성해 주세요.

8.
악기와 교구는
유치원이나 어린이집에서
준비하기 쉬운 수준으로 제안해 주세요.

9.
유아 활동에서 필요한
안전 또는 운영상 주의사항을
교사 팁에 포함해 주세요.

10.
한국어로 쉽고 자연스럽게
작성해 주세요.


[반드시 지켜야 할 출력 형식]


1. 수업 제목


2. 대상 연령


3. 전체 수업 시간


4. 수업 목표

- 목표 1
- 목표 2
- 목표 3


5. 핵심 음악 개념


6. 준비물


7. 활용 클래식 음악

- 작곡가
- 작품명
- 추천 이유
- 수업 활용 방법


8. 도입

- 예상 시간
- 교사 진행 방법
- 유아 활동


9. 전개 활동 1

- 예상 시간
- 활동 이름
- 활동 방법
- 교사 발문 예시
- 음악교육적 의미


10. 전개 활동 2

- 예상 시간
- 활동 이름
- 활동 방법
- 교사 발문 예시
- 음악교육적 의미


11. 마무리

- 예상 시간
- 활동 방법
- 유아와 나눌 질문


12. 교사 진행 팁

- 난이도 조절 방법
- 통합반 운영 방법
- 안전 또는 운영상 주의사항


13. 확장 활동

- 다음 차시로 연결할 수 있는
  활동 아이디어 1개


수업 시간에 맞지 않는
지나치게 많은 활동을 넣지 마세요.

같은 설명을 반복하지 말고
실제 교사가 그대로 참고할 수 있는
완성된 수업안으로 작성해 주세요.
"""


            # =========================================
            # OpenAI API 호출
            # =========================================

            client = OpenAI(
                api_key=OPENAI_API_KEY,
                timeout=40.0,
                max_retries=1
            )


            response = client.responses.create(
                model=OPENAI_MODEL,
                input=prompt
            )


            # =========================================
            # 결과 가져오기
            # =========================================

            result = response.output_text


            if not result or not result.strip():

                make_json_response(
                    self,
                    500,
                    {
                        "error":
                        "AI가 수업안을 생성하지 못했습니다. "
                        "잠시 후 다시 시도해 주세요"
                    }
                )

                return


            # =========================================
            # 정상 결과
            # =========================================

            make_json_response(
                self,
                200,
                {
                    "result":
                    result.strip()
                }
            )


        # =============================================
        # 오류 처리
        # =============================================

        except Exception as error:

            print(
                "AI GENERATION ERROR:",
                repr(error)
            )


            make_json_response(
                self,
                500,
                {
                    "error":
                    "AI 수업안 생성 중 오류가 발생했습니다. "
                    "잠시 후 다시 시도해 주세요"
                }
            )


    # -------------------------------------------------
    # 잘못된 GET 요청 안내
    # -------------------------------------------------

    def do_GET(self):

        make_json_response(
            self,
            405,
            {
                "error":
                "이 API는 POST 요청만 사용할 수 있습니다"
            }
        )