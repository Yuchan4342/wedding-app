import React from 'react';
import { Field, Fields, FieldArray, reduxForm } from 'redux-form';
import styled from 'styled-components';

import colors from '../../colors';
import Label from './Label';
import NameField from './NameField';
import AttendanceField from './AttendanceField';
import additionalAttendeesField from './additionalAttendeesField';
import PostalCodeField from './PostalCodeField';
import AddressField from './AddressField';
import AllergyEntryNotice from './AllergyEntryNotice';

const TextArea = styled(Field).attrs({
  className: 'shadow appearance-none text-gray-darker resize-y'
})`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid;
  border-radius: 0.25rem;
`;

const Button = styled.button.attrs({
  className: 'py-2 px-4 shadow rounded'
})`
  width: 100%;
  border: 1px solid;
  color: ${colors['white']};
  background-color: ${colors['blue-dark']};
  border: 1px solid;

  &:hover {
    color: ${colors['blue-dark']};
    background-color: ${colors['white']};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const prefectures = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
"茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
"山梨県", "長野県", "新潟県", "富山県", "石川県", "福井県", "岐阜県", "静岡県", "愛知県",
"三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
"鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県",
"福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];

const InvitationForm = ({ handleSubmit, pristine, submitting }) => {
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <Field name="attendance" component={AttendanceField} />
      <Fields names={['lastName', 'firstName']} component={NameField} />
      <FieldArray
        name="additionalAttendees"
        component={additionalAttendeesField}
      />
      <Field name="postalCode" component={PostalCodeField} />
      <Fields names={['prefecture', 'city', 'address1', 'address2']} component={AddressField} />
      <div className="mb-4">
        <Label htmlFor="message">メッセージ</Label>
        <TextArea name="message" id="message" component="textarea" className="min-h-[8em] leading-tight" />
      </div>
      <div className="mb-4">
        <Label htmlFor="note">備考</Label>
        <TextArea name="note" id="note" component="textarea" className="min-h-[6em] leading-tight" />
        <AllergyEntryNotice />
      </div>
      <div className="mb-4">
        <Button type="submit" disabled={pristine || submitting}>
          登録
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'invitation',
  validate: values => {
    const errors = {};
    if (!values.attendance) errors.attendance = '出欠を選んでください';
    if (!values.lastName) errors.lastName = '姓を入れてください';
    if (!values.firstName) errors.firstName = '名を入れてください';
    if (!values.postalCode) errors.postalCode = '郵便番号を入れてください';
    if (!values.prefecture) errors.prefecture = '都道府県を入れてください';
    if (!prefectures.includes(values.prefecture)) errors.prefecture = '存在する都道府県を入れてください';
    if (!values.city) errors.city = '市区町村を入れてください';
    if (!values.address1) errors.address1 = '町名・番地を入れてください';
    return errors;
  }
})(InvitationForm);
