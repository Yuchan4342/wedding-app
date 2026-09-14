import React from 'react';
import { Field } from 'redux-form';
import styled from 'styled-components';
import { RemoveCircleOutline, AddCircleOutline } from 'styled-icons/material';

const Input = styled(Field).attrs({
  className: 'shadow appearance-none text-gray-darker my-2'
})`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid;
  border-radius: 0.25rem;
`;

const InputAppendix = styled.div.attrs({
  className: 'flex-shrink self-center cursor-pointer'
})`
  padding: 0 0.5rem;
`;

const RemoveIcon = styled(RemoveCircleOutline).attrs({
  className: 'text-red'
})`
  width: 1rem;
  height: 1rem;
`;

const AddIcon = styled(AddCircleOutline)`
  width: 1rem;
  height: 1rem;
`;

const MAX_ADDITIONAL_ATTENDEES = 4;

const additionalAttendeesField = ({ fields }) => (
  <div className="mb-4">
    <div className="text-sm text-gray-darker">
      {fields.length > 0 ? (
        'お連れ様のお名前を入力してください'
      ) : (
        <a
          onClick={() => {
            fields.push();
          }}
        >
          <div className="flex items-center text-center">
            <AddIcon />
            <span className="text-sm">お連れ様がいらっしゃる場合</span>
          </div>
        </a>
      )}
    </div>

    {fields.map((attendee, index) => (
      <div key={index} className="flex">
        <Input name={attendee} type="text" component="input" />
        <InputAppendix
          onClick={() => {
            fields.remove(index);
          }}
        >
          <RemoveIcon />
        </InputAppendix>
      </div>
    ))}

    {fields.length > 0 && fields.length < MAX_ADDITIONAL_ATTENDEES && (
      <a
        onClick={() => {
          fields.push();
        }}
      >
        <div className="flex items-center text-center mt-2">
          <AddIcon />
          <span className="text-sm">お連れ様の追加</span>
        </div>
      </a>
    )}
  </div>
);

export default additionalAttendeesField;
