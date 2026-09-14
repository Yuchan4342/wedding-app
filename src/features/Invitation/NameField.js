import React from 'react';
import styled from 'styled-components';

import Label from './Label';
import ErrorFootnote from './ErrorFootnote';

const Input = styled.input.attrs({
  className: 'shadow appearance-none text-gray-darker'
})`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid;
  border-radius: 0.25rem;
`;

const NameField = ({ firstName, lastName }) => {
  return (
    <div className="mb-4">
      <div>
        <Label>ご芳名</Label>
        <div className="flex">
          <Input
            {...lastName.input}
            name="lastName"
            id="lastName"
            type="text"
            placeholder="姓"
            className="mr-2"
          />
          <Input
            {...firstName.input}
            name="firstName"
            type="text"
            placeholder="名"
          />
        </div>
      </div>
      {lastName.meta.touched &&
        (lastName.meta.error && (
          <ErrorFootnote>{lastName.meta.error}</ErrorFootnote>
        ))}
      {firstName.meta.touched &&
        (firstName.meta.error && (
          <ErrorFootnote>{firstName.meta.error}</ErrorFootnote>
        ))}
    </div>
  );
};

export default NameField;
