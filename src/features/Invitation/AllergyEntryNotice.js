import React from 'react';

import { eventInfo } from '../../configuration';

// 式場が用意する食物アレルギー登録フォームへの案内。
// 招待者固有のトークンを含む URL になることがあるため設定ファイルに外出ししてあり、
// 未設定であれば案内ごと表示しない。
const AllergyEntryNotice = () => {
  if (!eventInfo.allergyFormUrl) return null;

  return (
    <div className="my-4 text-sm leading-tight">
      食物アレルギーやその他の理由により<br />
      お食事に制限がある方は<br />
      <a href={eventInfo.allergyFormUrl} target="_blank" rel="noopener noreferrer">こちらのページ</a>より {eventInfo.rsvpDeadline}までに<br />
      登録をお願いいたします
    </div>
  );
};

export default AllergyEntryNotice;
