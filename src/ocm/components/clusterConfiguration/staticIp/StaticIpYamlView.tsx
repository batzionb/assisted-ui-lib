import React from 'react';
import {
  ExpandableSection,
  StackItem,
  Label,
  TextVariants,
  TextContent,
  Text,
  Stack,
  FlexItem,
  Flex,
  Divider,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Button,
  Checkbox,
  EmptyState,
  ExpandableSectionToggle,
  Form,
} from '@patternfly/react-core';
import {
  ArrayHelpers,
  FieldArray,
  FieldArrayRenderProps,
  useField,
  useFormikContext,
} from 'formik';
import { StaticIpValues } from '../../../services';
import {
  CodeField,
  getFieldId,
  HostStaticNetworkConfig,
  InputField,
  LoadingState,
  MacInterfaceMap,
  RenderIf,
} from '../../../../common';
import { Language } from '@patternfly/react-code-editor';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import StaticIpDataService from '../../../services/StaticIpDataService';
import { cloneDeep } from 'lodash';
import StaticIpHostsArray, { HostComponentProps, RemoveItemButton } from './StaticIpHostsArray';
import HostSummary from './HostSummary';

const AddMapping: React.FC<{
  onPush: ArrayHelpers['push'];
}> = ({ onPush }) => {
  return (
    <Button
      icon={<PlusCircleIcon />}
      isInline
      onClick={() => onPush({ macAddress: '', logicalNicName: '' })}
      data-testid="add-mapping"
    >
      Add another mapping
    </Button>
  );
};

const MacMappingItem: React.FC<{
  fieldName: string;
  onRemove: () => void;
  mapIdx: number;
  enableRemove: boolean;
}> = ({ fieldName, onRemove, mapIdx, enableRemove }) => {
  const [, { error }] = useField(fieldName);
  const [showRemoveButton, setShowRemoveButton] = React.useState(false);
  return (
    <Flex
      onMouseEnter={() => setShowRemoveButton(true)}
      onMouseLeave={() => setShowRemoveButton(false)}
    >
      <FlexItem>
        <InputField
          label="MAC address"
          isRequired
          name={`${fieldName}.macAddress`}
          data-testid={`mac-address-${mapIdx}`}
        ></InputField>
      </FlexItem>
      <FlexItem>
        <InputField
          label="Interface name"
          isRequired
          name={`${fieldName}.logicalNicName`}
          data-testid={`interface-name-${mapIdx}`}
        ></InputField>
      </FlexItem>
      {enableRemove && (
        <FlexItem alignSelf={{ default: error ? 'alignSelfCenter' : 'alignSelfFlexEnd' }}>
          <RemoveItemButton
            onRemove={onRemove}
            showRemoveButton={showRemoveButton}
            dataTestId={`remove-mapping-${mapIdx}`}
          />
        </FlexItem>
      )}
    </Flex>
  );
};

const MacMapping: React.FC<{
  fieldName: string;
  macInterfaceMap: MacInterfaceMap;
  hostIdx: number;
}> = ({ fieldName, macInterfaceMap, hostIdx }) => (
  <FieldArray
    name={fieldName}
    validateOnChange={false}
    render={({ push, remove }) => (
      <Stack hasGutter data-testid={`mac-mapping-${hostIdx}`}>
        {macInterfaceMap.map((value, idx) => (
          <StackItem key={`${fieldName}[${idx}]`}>
            <MacMappingItem
              fieldName={`${fieldName}[${idx}]`}
              onRemove={() => remove(idx)}
              mapIdx={idx}
              enableRemove={idx > 0}
            />
          </StackItem>
        ))}
        <StackItem>
          <AddMapping onPush={push} />
        </StackItem>
      </Stack>
    )}
  ></FieldArray>
);

const CollapsedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField, { error }] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];
  let hasError = !!error;
  let macAddress = '';
  let mapValue = '';
  if (!macInterfaceMap.length) {
    hasError = true;
  } else {
    macAddress = macInterfaceMap[0].macAddress || '';
    mapValue = macInterfaceMap[0].logicalNicName || '';
  }
  return (
    <HostSummary
      title="MAC to IP mapping"
      numInterfaces={macInterfaceMap.length}
      macAddress={macAddress}
      mappingValue={mapValue}
      hostIdx={hostIdx}
      hasError={hasError}
    ></HostSummary>
  );
};

const ExpandedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];
  return (
    <Form>
      <FormGroup label="" fieldId={getFieldId('nmstateYaml', 'inputs')}>
        <CodeField
          language={Language.yaml}
          name={`${fieldName}.networkYaml`}
          data-testid={`yaml-${hostIdx}`}
        />
      </FormGroup>
      <FormGroup
        label="Mac to interface name mapping"
        fieldId={getFieldId('macNicMaping', 'inputs')}
      >
        <MacMapping fieldName={mapFieldName} macInterfaceMap={macInterfaceMap} hostIdx={hostIdx} />
      </FormGroup>
    </Form>
  );
};

const StaticIpYamlView: React.FC = () => {
  const [{ value }] = useField<HostStaticNetworkConfig[]>({
    name: 'yamlData',
  });
  if (!value) {
    return <LoadingState />;
  }
  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.small}>
            Upload, drag and drop, or copy and paste a YAML file that contains NMstate into the
            editor for network configurations. Each host also needs the MAC to interface name
            mapping.
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <StaticIpHostsArray<HostStaticNetworkConfig>
          fieldName="yamlData"
          ExpandedHostComponent={ExpandedHost}
          CollapsedHostComponent={CollapsedHost}
          emptyHostData={StaticIpDataService.getEmptyHostYamlData()}
          enableCopyAboveConfiguration={true}
        ></StaticIpHostsArray>
      </StackItem>
    </Stack>
  );
};

export default StaticIpYamlView;
