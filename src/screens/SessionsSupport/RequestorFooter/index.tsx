import React from 'react';
import { HStack, Text, Button, ButtonText } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';

interface RequestFooterProps {
  item: any;
  onAssignSession?: (item: any) => void;
}

export const RequestFooter: React.FC<RequestFooterProps> = ({ item, onAssignSession }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const sessionId = item?.id || item?._id || '';
  const mentorName = item?.mentor_name || '';

  const handleViewDetails = () => {
    // @ts-ignore
    navigation.navigate('session-details', { sessionId });
  }
  // const handleAssignSession = () => {
  //   if (onAssignSession) {
  //     onAssignSession(item);
  //   } else {
  //     // @ts-ignore
  //     navigation.navigate('AssignSession', { sessionId });
  //   }
  // }

  return (
    <HStack {...styles.requestorFooter}>
      <Text {...styles.requestorFooterText}>
        {t('supportProvider.supportOfferings.cards.providedBy')}{' '}
        <Text {...styles.requestorFooterOrgText}>
          {mentorName}
        </Text>
      </Text>

      <HStack {...styles.requestorFooterActions}>
        <Button
          variant={"outlineghost" as any}
          {...styles.requestorFooterViewDetailsButton}
          onPress={handleViewDetails}
        >
          <ButtonText {...(styles.requestorFooterViewDetailsText as any)}>
            {t('supportProvider.supportOfferings.cards.viewDetails', 'View Details')}
          </ButtonText>
        </Button>

        {/* <Button
          variant="solid"
          {...styles.requestorFooterAssignButton}
          onPress={handleAssignSession}
        >
          <ButtonText {...(styles.requestorFooterAssignText as any)}>
            {t('supportProvider.supportOfferings.cards.assignSession', 'Assign Session')}
          </ButtonText>
        </Button> */}
      </HStack>
    </HStack>
  );
};
