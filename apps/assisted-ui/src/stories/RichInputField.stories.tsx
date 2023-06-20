import { Meta, StoryObj } from '@storybook/react';
import { Formik } from 'formik';
import React from 'react';
import { TFunction } from 'react-i18next';

import * as yup from 'yup';

import { Form } from '@patternfly/react-core';
import { acmClusterNameValidationMessages, getRichTextValidation, nameValidationSchema, RichInputField } from '@openshift-assisted/ui-lib/ocm';

const NameFieldWrapper = ({ initialName }: { initialName: string }) => {
  const tFunction: TFunction = (text: string) => text;
  
  const validationSchema = React.useMemo<yup.Schema<{ name: string }>>(() => {
    return yup.object().shape({
      name: yup.string().concat(nameValidationSchema(tFunction, [])),
    });
  }, []);
  return (
    <Formik
      initialValues={{ name: initialName }}
      onSubmit={(values) => console.log(values)}
      validateOnMount
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      validate={getRichTextValidation<{ name: string }>(validationSchema)}
    >
      <Form>
        <RichInputField
            label="Name"
            name="name"
            placeholder="Enter a name"
            richValidationMessages={acmClusterNameValidationMessages(tFunction)}
            isRequired
          />
      </Form>
    </Formik>
  );
};

const meta: Meta<typeof NameFieldWrapper> = {
  title: 'NameField',
  component: NameFieldWrapper,
};

export default meta;
type Story = StoryObj<typeof NameFieldWrapper>;

export const NameFieldStory: Story = {
  args: {
    initialName: '',
  },
};
