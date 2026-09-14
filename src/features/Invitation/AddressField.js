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

const AddressField = ({ prefecture, city, address1, address2  }) => {
  return (
    <div className="mb-4">
      <Label htmlFor="prefecture">住所</Label>
      <div className="mb-2">
        <Input
          {...prefecture.input}
          name="prefecture"
          id="prefecture"
          component="text"
          placeholder="都道府県"
          autoComplete="shipping address-level1"
          className="leading-tight"
        />
      </div>
      <div className="mb-2">
        <Input
          {...city.input}
          name="city"
          id="city"
          component="text"
          placeholder="市区町村"
          autoComplete="shipping address-level2"
          className="leading-tight"
        />
      </div>
      <div className="mb-2">
        <Input
          {...address1.input}
          name="address1"
          id="address1"
          component="text"
          placeholder="町名・番地"
          autoComplete="shipping address-line1"
          className="leading-tight"
        />
      </div>
      <div className="mb-2">
        <Input
          {...address2.input}
          name="address2"
          id="address2"
          component="text"
          placeholder="建物名等"
          autoComplete="shipping address-line2"
          className="leading-tight"
        />
      </div>
      {prefecture.meta.touched && (prefecture.meta.error && (
          <ErrorFootnote>{prefecture.meta.error}</ErrorFootnote>
        ))}
      {city.meta.touched && (city.meta.error && (
          <ErrorFootnote>{city.meta.error}</ErrorFootnote>
        ))}
      {address1.meta.touched && (address1.meta.error && (
          <ErrorFootnote>{address1.meta.error}</ErrorFootnote>
        ))}
    </div>
  );
};

export default AddressField;
