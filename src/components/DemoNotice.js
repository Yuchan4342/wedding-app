import React from 'react';
import styled from 'styled-components';

const Bar = styled.div.attrs({
  className: 'bg-teal text-white text-xs text-center px-4 py-2'
})`
  position: sticky;
  z-index: 99;
  top: 0;
`;

// デモモードであることを、ログイン前後を問わず画面上部に表示する
function DemoNotice() {
  return (
    <Bar>
      デモモードです。任意の ID とパスワードでログインできます。
      回答はこのブラウザ内にのみ保存され、送信されません。
    </Bar>
  );
}

export default DemoNotice;
