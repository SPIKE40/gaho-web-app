import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb ,faCogs,faSpinner} from '@fortawesome/free-solid-svg-icons';
import './CategorySelector.css';
import { GPT4oCallFunction, sanitizeMessage } from './CommonFunctions';

library.add(faLightbulb,faCogs,faSpinner);

const categories = {
  "인문": ["언어", "문학", "철학", "민속", "기타인문", "문자", "민족", "가족", "촌락"],
  "역사": ["한국사", "선사문화", "고대사", "고려시대사", "조선시대사", "근대사", "현대사"],
  "정치": ["정치", "법제", "외교"],
  "경제": ["부동산", "금융", "비즈니스", "마케팅"],
  "법률": ["형법", "세법", "회계", "특허"],
  "사회": ["복지", "군사", "경영", "국방", "행정", "북한", "사회학", "심리학"],
  "매체": ["방송", "뉴스", "잡지", "출판", "언론", "인쇄"],
  "교육": ["유아교육기관", "초등학교", "중학교", "고등학교", "대학교", "학원/학습", "기타교육기관", "교재/교육용품", "교육정보"],
  "산업": ["농업", "수산업", "임업", "광업", "공업", "서비스업"],
  "자연과학": ["천연자원", "수학", "물리학", "화학", "생물학", "화학공학", "생태학", "환경과학", "농업과학", "지구", "지리", "해양", "천문"],
  "의약학": ["일반의학", "약학", "한의학", "수의학"],
  "일반공학": ["토목공학", "컴퓨터과학", "전기공학", "전자공학", "정보기술/IT", "재료공학", "기계공학", "건축", "인테리어"],
  "응용과학": ["항공공학", "에너지 관리", "가스 기술 및 공학", "지형정보학", "산업공학", "해양공학", "비파괴 건사", "철도 및 자동차 공학", "통신 및 무선 기술"],
  "보건": ["건강", "공공 안전"],
  "식품": ["가공 식품", "일반 식품", "음료"],
  "문화": ["게임", "여행", "영화", "패션 잡화", "패션 종합", "뷰티", "종합 쇼핑"],
  "생활": ["식생활", "의생활", "주생활", "가정/생황", "결혼/출산/육아", "취업"],
  "예체능": ["체육", "연기", "영상", "무용", "음악", "미술", "공예", "국악", "대중음악", "서예", "연극", "조각", "현대음악", "예체능 기타"],
  "종교": ["가톨릭/천주교", "개신교/기독교", "불교", "원불교", "유교", "대종교", "도교", "민간신앙", "신종교", "천도교"],
  "기타": ["기타"]
};

const mainCategories = Object.keys(categories);

export const buildMainCategorySystemMessage = () => {
  const mainCategoriesList = mainCategories.map(main => `- **${main}**`).join('\n');

  const systemMessage = `
당신은 주어진 텍스트를 미리 정의된 대분류로 정확하게 분류하는 전문적인 어시스턴트입니다. 아래는 대분류의 목록입니다. 이 목록을 사용하여 정확한 분류를 수행하세요.

${mainCategoriesList}

작업 지침:

1. 입력된 텍스트를 분석하여 적절한 대분류를 선택하세요.
2. 응답 형식은 반드시 순수한 JSON 객체로만 반환하세요. 마크다운, 코드 블록, 추가 텍스트는 포함하지 마세요. 형식은 다음과 같습니다:
   {
     "대분류": "선택된 대분류"
   }
3. 예시:
   - 입력 텍스트: "최근 주식 시장의 변동성이 높아졌습니다."
   - 응답:
     {
       "대분류": "경제"
     }
4. 입력된 텍스트가 여러 카테고리에 걸쳐 있을 경우, 가장 관련성이 높은 대분류를 선택하세요.
5. 선택된 대분류에 대한 설명은 포함하지 마세요.
6. 만약 적절한 분류가 없다고 판단되면, "기타"를 선택하세요.

추가 지침:

- 대분류는 반드시 제공된 목록에서 선택하세요.
- 응답에 절대적으로 추가 텍스트나 설명을 포함하지 마세요.
- 응답 형식이 올바르지 않거나 제공된 목록에 없는 대분류가 선택된 경우, "기타"로 분류하세요.
`;

  return systemMessage;
};

export const buildSubCategorySystemMessage = (selectedMainCategory) => {
  const subCategories = categories[selectedMainCategory] || ["기타"];
  const subCategoriesList = subCategories.map(sub => `- **${sub}**`).join('\n');

  const systemMessage = `
당신은 주어진 텍스트를 선택된 대분류에 속하는 소분류로 정확하게 분류하는 전문적인 어시스턴트입니다. 아래는 대분류 "${selectedMainCategory}"에 속하는 소분류의 목록입니다. 이 목록을 사용하여 정확한 분류를 수행하세요.

${subCategoriesList}

작업 지침:

1. 입력된 텍스트를 분석하여 적절한 소분류를 선택하세요.
   - 반드시 선택된 대분류에 속하는 소분류만 선택해야 합니다.
2. 응답 형식은 반드시 순수한 JSON 객체로만 반환하세요. 마크다운, 코드 블록, 추가 텍스트는 포함하지 마세요. 형식은 다음과 같습니다:
   {
     "소분류": "선택된 소분류"
   }
3. 예시:
   - 입력 텍스트: "최근 주식 시장의 변동성이 높아졌습니다."
   - 응답:
     {
       "소분류": "금융"
     }
4. 입력된 텍스트가 여러 소분류에 걸쳐 있을 경우, 가장 관련성이 높은 소분류를 선택하세요.
5. 선택된 소분류에 대한 설명은 포함하지 마세요.
6. 만약 적절한 분류가 없다고 판단되면, "기타"를 선택하세요.

추가 지침:

- 소분류는 반드시 제공된 목록에서 선택하세요.
- 응답에 절대적으로 추가 텍스트나 설명을 포함하지 마세요.
- 응답 형식이 올바르지 않거나 제공된 목록에 없는 소분류가 선택된 경우, "기타"로 분류하세요.
`;

  return systemMessage;
};



export const autoCategorySelector = async (message) => {
  const customMaxTokens = 250;
  const customTemperature = 0; // 최대한 정확하고 일관된 응답을 위해 0으로 설정

  try {
    // 1. 대분류 분류
    const mainCategoryMessages = [
      {
        role: 'system',
        content: buildMainCategorySystemMessage(),
      },
      {
        role: 'user',
        content: `다음 텍스트를 분류해주세요: "${message}"`,
      },
    ];

    const mainCategoryOutput = await GPT4oCallFunction({
      messages: mainCategoryMessages,
      max_tokens: customMaxTokens,
      temperature: customTemperature,
    });

    console.log('대분류 GPT 응답:', mainCategoryOutput);

    // 대분류 응답에서 JSON 부분만 추출
    const mainJsonMatch = mainCategoryOutput.match(/\{[\s\S]*\}/);
    if (!mainJsonMatch) {
      throw new Error('대분류 응답에서 JSON을 찾을 수 없습니다.');
    }

    let mainParsedResponse;
    try {
      mainParsedResponse = JSON.parse(mainJsonMatch[0]);
    } catch (jsonError) {
      console.error('대분류 JSON 파싱 오류:', jsonError);
      throw new Error('대분류 응답을 JSON 형식으로 파싱하는 데 실패했습니다.');
    }

    const { 대분류 } = mainParsedResponse;

    if (!대분류) {
      console.error('대분류가 응답에 포함되지 않았습니다.');
      throw new Error('대분류가 응답에 포함되지 않았습니다.');
    }

    if (대분류 === "기타") {
      console.log('대분류가 "기타"로 분류되었습니다.');
      return { mainCategory: "기타", subCategory: "기타" };
    }

    // 2. 소분류 분류
    const subCategoryMessages = [
      {
        role: 'system',
        content: buildSubCategorySystemMessage(대분류),
      },
      {
        role: 'user',
        content: `다음 텍스트를 "${대분류}" 대분류에 속하는 소분류로 분류해주세요: "${message}"`,
      },
    ];

    const subCategoryOutput = await GPT4oCallFunction({
      messages: subCategoryMessages,
      max_tokens: customMaxTokens,
      temperature: customTemperature,
    });

    console.log('소분류 GPT 응답:', subCategoryOutput);

    // 소분류 응답에서 JSON 부분만 추출
    const subJsonMatch = subCategoryOutput.match(/\{[\s\S]*\}/);
    if (!subJsonMatch) {
      throw new Error('소분류 응답에서 JSON을 찾을 수 없습니다.');
    }

    let subParsedResponse;
    try {
      subParsedResponse = JSON.parse(subJsonMatch[0]);
    } catch (jsonError) {
      console.error('소분류 JSON 파싱 오류:', jsonError);
      throw new Error('소분류 응답을 JSON 형식으로 파싱하는 데 실패했습니다.');
    }

    const { 소분류 } = subParsedResponse;

    if (!소분류) {
      console.error('소분류가 응답에 포함되지 않았습니다.');
      throw new Error('소분류가 응답에 포함되지 않았습니다.');
    }

    // 소분류가 대분류에 속하는지 검증
    if (categories[대분류].includes(소분류)) {
      console.log('카테고리 AI 분석 완료', { mainCategory: 대분류, subCategory: 소분류 });
      return { mainCategory: 대분류, subCategory: 소분류 };
    } else {
      console.error('소분류가 대분류에 속하지 않습니다. 자동으로 "기타"로 분류합니다.');
      return { mainCategory: "기타", subCategory: "기타" };
    }

  } catch (error) {
    console.error('AI 분석 중 오류 발생:', error);
    // 오류 발생 시 "기타"로 분류
    return { mainCategory: "기타", subCategory: "기타" };
  }
};


const CategorySelector = ({
  selectedMainCategory,
  selectedSubCategory,
  setSelectedMainCategory,
  setSelectedSubCategory,
  jsonData
}) => {
  const handleMainCategoryChange = (e) => {
    setSelectedMainCategory(e.target.value);
    setSelectedSubCategory('');
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  // AI 추천 핸들러
  const handleAIrecom = async () => {
    setIsLoading(true);
    /////////////////////////////////////////카테고리 분석 영역/////////////////////////////////////////////////
    const cleantext = sanitizeMessage(jsonData.content);
    console.log('전처리된 메세지:', cleantext);
    const { mainCategory, subCategory } = await autoCategorySelector(cleantext);
    console.log('AI가 반환한 대분류:', mainCategory);
    console.log('AI가 반환한 소분류:', subCategory);
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(subCategory);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    setIsLoading(false);
  };

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  return (
    <div className="category-selector">
      <div className="select-group compact">
        <div>
          <button className="ai-recommandation" onClick={handleAIrecom} disabled={isLoading} title="자동분류머신: 대분류와 소분류를 AI가 판단하여 분류">
          <FontAwesomeIcon
            icon={isLoading ? "spinner" : "cogs"}
            spin={isLoading}
            style={{ marginRight: '2px' }}
          />
          {isLoading ? "!" : "AI"}
          </button>
        </div>
        <div className="select-item">
          <label htmlFor="main-category" className="select-label">
            대분류:
          </label>
          <select
            id="main-category"
            value={selectedMainCategory}
            onChange={handleMainCategoryChange}
            className="select-box"
          >
            <option value="">-- 선택 --</option>
            {Object.keys(categories).map((mainCategory) => (
              <option key={mainCategory} value={mainCategory}>
                {mainCategory}
              </option>
            ))}
          </select>
        </div>

        <div className="select-item">
          <label htmlFor="sub-category" className="select-label">
            소분류:
          </label>
          <select
            id="sub-category"
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
            className="select-box"
            disabled={!selectedMainCategory}
          >
            <option value="">
              {selectedMainCategory ? '-- 선택 --' : '-- 대분류 먼저 --'}
            </option>
            {selectedMainCategory &&
              categories[selectedMainCategory]?.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;