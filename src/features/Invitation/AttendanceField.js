import React from 'react';

import ErrorFootnote from './ErrorFootnote';
import styled from 'styled-components';

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
`;

const AttendanceField = ({ input, meta: { submitFailed, error } }) => {
  return (
    <div className="my-8">
      <div className="flex justify-around">
        <RadioItem>
          <input {...input} name="attendance" type="radio" value="true" />
          <div className="ml-2">ご出席</div>
        </RadioItem>
        <RadioItem>
          <input {...input} name="attendance" type="radio" value="false" />
          <div className="ml-2">ご欠席</div>
        </RadioItem>
      </div>
      <div className="text-center">
        {submitFailed && error && <ErrorFootnote>{error}</ErrorFootnote>}
      </div>
    </div>
  );
};

export default AttendanceField;
