import React from 'react';

import { eventInfo } from '../../configuration';

const src = `https://www.google.com/maps/embed/v1/place?q=${
  eventInfo.googleMapQuery
}&key=${eventInfo.googleMapKey}`;

// API キーが未設定だと Google 側のエラー画面が出てしまうため、その場合は描画しない
const EmbededGoogleMap = () => {
  if (!eventInfo.googleMapKey) return null;

  return (
    <div className="max-w-[940px] mx-auto">
      <iframe
        title="googlemap"
        height="450"
        frameBorder="0"
        className="border-none w-full"
        src={src}
        allowFullScreen
      />
    </div>
  );
};

export default EmbededGoogleMap;
