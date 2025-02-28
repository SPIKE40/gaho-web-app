const apiUrl = process.env.REACT_APP_OPENAI_API_URL;
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

export const GPT4oCallFunction = async ({
  messages,
  max_tokens = 200,
  temperature = 0.7,
}) => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        messages,
        max_tokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    return responseText;

  } catch (error) {
    console.error('Error:', error);
    alert('GPT-4 요청 중 오류가 발생했습니다.');
  }
};

export const AnalysisFilesFunction = async ({
  uuid
}) => {
  const formData = new FormData();
  formData.append('uuid', uuid)
  try {
    const response = await fetch(process.env.REACT_APP_URL_AGENT + "/analysisfiles", {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const docItems = await response.json();
    return docItems;
  } catch (error) {
    console.error('Error:', error);
    alert('Analysis 요청 중 오류가 발생했습니다.');
  }
};

export const AnalysisFilesDownloadFunction = async ({
  uuid,
  gpuOn
}) => {
  const formData = new FormData();
  formData.append('uuid', uuid)
  formData.append('gpu_on', gpuOn)
  try {
    const response = await fetch(process.env.REACT_APP_URL_AGENT + "/analysisfiles-download", {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const urlResponse = await response.json();
    return urlResponse;
  } catch (error) {
    console.error('Error:', error);
    alert('Analysis 요청 중 오류가 발생했습니다');
  }
};

const stopwords = [
  '은', '는', '이', '가', '을', '를', '에', '의', '도', '으로',
  '하고', '해서', '입니다', '저는', '그는', '그녀는', '그리고',
  '하지만', '또한', '그런데', '왜냐하면', '그러나', '에서',
  '부터', '까지', '까지는', '에 대해서', '에 대해',
  
   // 개발 관련 불용어 추가
   'table', 'td', 'tr', 'bordercollapse', 'collapseborder', 'blackwidth', 'padding',
   'black', 'solid', 'px', 'percent', 'width', 'height', 'color', 'font', 'size',
   'border', 'margin', 'padding', 'display', 'block', 'inline', 'flex', 'grid',
   'position', 'absolute', 'relative', 'fixed', 'static', 'float', 'clear', 'overflow',
   'visible', 'hidden', 'scroll', 'auto', 'none', 'inline-block', 'inline-flex',
   'white-space', 'text-align', 'justify-content', 'align-items', 'align-content',
];

/**
 * 간단한 공백 기반 토크나이저를 사용하여 불용어를 제거합니다.
 * @param {string} text - 입력된 한국어 문장
 * @returns {string} - 불용어가 제거된 문장
 */
export function removeStopwords(text) {
  const words = text.split(/\s+/);

  // 불용어 제거
  const filteredWords = words.filter(word => !stopwords.includes(word));

  return filteredWords.join(' ');
}


/**
 * 주어진 메시지에서 텍스트만 추출하고 중복 단어를 제거하는 함수
 * @param {string} message - 원본 메시지
 * @returns {string} - 텍스트만 남기고 중복 단어가 제거된 메시지
 */
export const sanitizeMessage = (message) => {
    // 1. HTML 태그 제거
    const withoutHTML = message.replace(/<[^>]*>/g, '');

    // 2. CSS 블록 제거 (중괄호와 그 안의 내용)
    const withoutCSS = withoutHTML.replace(/\{[^}]*\}/g, '').replace(/}/g, '').trim();
  
    // 3. 한글, 영어, 숫자, 특정 특수문자만 남기고 나머지 제거
    // 허용할 특수문자를 필요에 따라 추가 또는 수정하세요.
    const allowedCharacters = withoutCSS.replace(/[^가-힣a-zA-Z0-9\s!@#$%^&*(),.?":<>]/g, '').trim();
  
    // 4. 불용어 제거
    const rmStopWords = removeStopwords(allowedCharacters);
  
    // 5. 단어 분리 (공백 기준)
    const words = rmStopWords.split(/\s+/);
  
    // 6. 중복 단어 제거
    const uniqueWords = [];
    const seen = new Set();
  
    words.forEach((word) => {
      if (!seen.has(word)) {
        seen.add(word);
        uniqueWords.push(word);
      }
    });
  
    // 7. 중복이 제거된 단어들을 다시 문자열로 결합
    const cleanText = uniqueWords.join(' ');
  
    return cleanText;
};













