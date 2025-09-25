// 간단한 테스트 스크립트
console.log('Test script loaded!');

function TestApp() {
  return React.createElement('div', { className: 'p-4 text-center' },
    React.createElement('h1', { className: 'text-3xl font-bold text-blue-600' }, 
      '테스트가 성공했습니다!'
    ),
    React.createElement('p', { className: 'text-gray-600 mt-4' },
      'React와 Tailwind가 정상적으로 작동하고 있습니다.'
    )
  );
}

// DOM이 로드되면 렌더링
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, rendering test app...');
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(React.createElement(TestApp), root);
    console.log('Test app rendered!');
  } else {
    console.error('Root element not found!');
  }
});