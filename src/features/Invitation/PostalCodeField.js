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

const PostalCodeField = ({ input, meta: { touched, error }  }) => {
  return (
    <div className="mb-4">
      <div>
        <Label htmlFor="postalCode">郵便番号</Label>
        <Input
          {...input}
          name="postalCode"
          id="postalCode"
          type="text"
          placeholder="ハイフン有無どちらも可"
          minLength="7"
          maxLength="8"
          pattern="\d{3}-?\d{4}"
          autoComplete="shipping postal-code"
          className="leading-tight"
        />
      </div>
      <div>
        {touched && error && (
            <ErrorFootnote>{error}</ErrorFootnote>
          )}
      </div>
    </div>
  );
};

export default PostalCodeField;
