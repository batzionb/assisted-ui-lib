import {
  Button,
  ButtonVariant,
  Checkbox,
  Divider,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { FieldArray, FieldArrayRenderProps, useField } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { LoadingState } from '../../../../common';
import ConfirmationModal from '../../../../common/components/ui/ConfirmationModal';

export type HostComponentProps = {
  fieldName: string;
  hostIdx: number;
};

export type HostArrayProps<HostFieldType> = {
  fieldName: string;
  emptyHostData: HostFieldType;
  enableCopyAboveConfiguration?: boolean;
  CollapsedHostComponent: React.FC<HostComponentProps>;
  ExpandedHostComponent: React.FC<HostComponentProps>;
};

type HostsProps<HostFieldType> = HostArrayProps<HostFieldType> & FieldArrayRenderProps;

type SingleHostProps<HostFieldType> = {
  hostIdx: number;
  onRemove: () => void;
  onToggleExpand: (isExpanded: boolean) => void;
  isExpanded: boolean;
  emptyHostData: HostFieldType;
  CollapsedHostComponent: React.FC<HostComponentProps>;
  ExpandedHostComponent: React.FC<HostComponentProps>;
  fieldName: string;
  enableRemoveHost: boolean;
};

export const RemoveItemButton: React.FC<{
  onRemove: () => void;
  showRemoveButton: boolean;
  dataTestId: string;
}> = ({ onRemove, showRemoveButton, dataTestId }) => (
  //use css visibility instead of conditional rendering to avoid button jumping when hovering
  <Button
    aria-label="remove host"
    style={{ visibility: showRemoveButton ? 'visible' : 'hidden' }}
    variant="plain"
  >
    <MinusCircleIcon onClick={onRemove} data-testid={dataTestId} />
  </Button>
);

const getHostName = (hostIdx: number) => `Host ${hostIdx + 1}`;

const SingleHost = <HostFieldType,>({
  fieldName,
  hostIdx,
  onRemove,
  onToggleExpand,
  isExpanded,
  CollapsedHostComponent,
  ExpandedHostComponent,
  enableRemoveHost,
}: SingleHostProps<HostFieldType>) => {
  const [showRemoveButton, setShowRemoveButton] = React.useState(false);
  const updateShowRemoveButton = (value: boolean) => {
    if (!enableRemoveHost) {
      setShowRemoveButton(false);
    } else {
      setShowRemoveButton(value);
    }
  };
  return (
    <Stack
      hasGutter
      onMouseEnter={() => updateShowRemoveButton(true)}
      onMouseLeave={() => updateShowRemoveButton(false)}
    >
      <StackItem>
        <Flex>
          <FlexItem>
            <ExpandableSectionToggle
              isExpanded={isExpanded}
              onToggle={onToggleExpand}
              direction="down"
              data-testid={`toggle-host-${hostIdx}`}
            >
              {getHostName(hostIdx)}
            </ExpandableSectionToggle>
          </FlexItem>
          {hostIdx > 0 && (
            <FlexItem align={{ default: 'alignRight' }}>
              <RemoveItemButton
                onRemove={onRemove}
                showRemoveButton={showRemoveButton}
                dataTestId={`remove-host-${hostIdx}`}
              />
            </FlexItem>
          )}
        </Flex>
      </StackItem>
      <StackItem>
        <ExpandableSection isDetached key={hostIdx} isExpanded={isExpanded}>
          {isExpanded && (
            <ExpandedHostComponent fieldName={`${fieldName}[${hostIdx}]`} hostIdx={hostIdx} />
          )}
        </ExpandableSection>
      </StackItem>
      <StackItem>
        {!isExpanded && (
          <CollapsedHostComponent fieldName={`${fieldName}[${hostIdx}]`} hostIdx={hostIdx} />
        )}
      </StackItem>
    </Stack>
  );
};

type ExpandedHosts = { [hostIdx: number]: boolean };

const getExpandedHostsInitialValue = (numHosts: number): ExpandedHosts => {
  const ret = {};
  for (let i = 0; i < numHosts; ++i) {
    ret[i] = false;
  }
  return ret;
};

const getExpandedHostsDefaultValue = (numHosts: number): ExpandedHosts => {
  const ret = getExpandedHostsInitialValue(numHosts);
  ret[0] = true;
  return ret;
};

const Hosts = <HostFieldType,>({
  push,
  remove,
  fieldName,
  enableCopyAboveConfiguration,
  emptyHostData,
  ...props
}: HostsProps<HostFieldType>) => {
  const [field] = useField<HostFieldType[]>({
    name: fieldName,
  });
  const [expandedHosts, setExpandedHosts] = React.useState<ExpandedHosts>(
    getExpandedHostsDefaultValue(field.value.length),
  );
  const [copyConfiguration, setCopyConfiguration] = React.useState<boolean>(
    !!enableCopyAboveConfiguration,
  );
  const [hostIdxToRemove, setHostIdxToRemove] = React.useState<number | null>(null);

  if (field.value === undefined) {
    return <LoadingState />;
  }

  const onAddHost = () => {
    let newHostData: HostFieldType;
    if (copyConfiguration) {
      newHostData = cloneDeep(field.value[field.value.length - 1]);
    } else {
      newHostData = cloneDeep(emptyHostData);
    }
    const newExpandedHosts = getExpandedHostsInitialValue(field.value.length + 1);
    newExpandedHosts[field.value.length] = true;
    setExpandedHosts(newExpandedHosts);
    push(newHostData);
  };

  const onRemoveHost = (hostIdx: number) => {
    setHostIdxToRemove(hostIdx);
  };

  return (
    <Stack hasGutter>
      {field.value.map((data, hostIdx) => {
        const onToggleExpand = (isExpanded: boolean) => {
          const newExpandedHosts = cloneDeep(expandedHosts);
          newExpandedHosts[hostIdx] = isExpanded;
          setExpandedHosts(newExpandedHosts);
        };
        return (
          <React.Fragment key={hostIdx}>
            <StackItem>
              <SingleHost
                hostIdx={hostIdx}
                onToggleExpand={onToggleExpand}
                isExpanded={expandedHosts[hostIdx]}
                onRemove={() => onRemoveHost(hostIdx)}
                fieldName={fieldName}
                emptyHostData={emptyHostData}
                enableRemoveHost={field.value.length > 1}
                {...props}
              />
            </StackItem>
            <StackItem>
              <Divider />
            </StackItem>
          </React.Fragment>
        );
      })}
      <StackItem>
        <Flex>
          <FlexItem>
            <Button variant="secondary" onClick={onAddHost} data-testid="add-host">
              Add another host
            </Button>
          </FlexItem>
          {enableCopyAboveConfiguration && (
            <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
              <Checkbox
                label="Copy the above configuration"
                isChecked={copyConfiguration}
                onChange={setCopyConfiguration}
                aria-label="copy host configuration"
                name="copy-host-configuration"
                id="copy-host-configuration"
                data-testid="copy-host-cofiguration"
              />
            </FlexItem>
          )}
        </Flex>
      </StackItem>
      {hostIdxToRemove && (
        <ConfirmationModal
          title={`Delete ${getHostName(hostIdxToRemove)}?`}
          titleIconVariant="warning"
          confirmationButtonText="Delete"
          confirmationButtonVariant={ButtonVariant.primary}
          content={
            <>
              <p>{`All the network configurations of ${getHostName(
                hostIdxToRemove,
              )} will be lost`}</p>
            </>
          }
          onClose={() => setHostIdxToRemove(null)}
          onConfirm={() => {
            remove(hostIdxToRemove);
            setHostIdxToRemove(null);
          }}
        />
      )}
    </Stack>
  );
};

const StaticIpHostsArray = <HostFieldType,>({
  fieldName,
  ...props
}: HostArrayProps<HostFieldType>) => {
  const renderHosts = React.useCallback(
    (arrayRenderProps: FieldArrayRenderProps) => (
      <Hosts fieldName={fieldName} {...Object.assign(props, arrayRenderProps)} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <FieldArray name={fieldName} render={renderHosts} />;
};

export default StaticIpHostsArray;
