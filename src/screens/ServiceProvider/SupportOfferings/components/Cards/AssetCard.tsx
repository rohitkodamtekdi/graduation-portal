import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  LucideIcon,
  Badge,
  BadgeText,
  useAlert,
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
} from '@ui';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@contexts/LanguageContext';
import type { AssetItem } from '../../../../../types/supportOfferingsTypes';
import { cancelSession } from '../../../../../services/mentoringService';
import CancelInterventionModal from '../modals/CancelInterventionModal';
import styles from '../../styles';

// ---------- Card ----------

interface CardProps {
  item: AssetItem;
  provinces?: any[];
  sites?: any[];
}

const getDeliveryMode = (item: AssetItem): 'offline' | 'online' | 'hybrid' => {
  const rawMode = (
    (typeof item.delivery_mode === 'object' ? item.delivery_mode?.value : item.delivery_mode) ||
    ''
  ).toLowerCase();

  if (rawMode.includes('hybrid')) {
    return 'hybrid';
  }
  if (rawMode.includes('online') || rawMode.includes('virtual')) {
    return 'online';
  }
  return 'offline';
};

const getDeliveryBadge = (deliveryMode: 'offline' | 'online' | 'hybrid') => {
  if (deliveryMode === 'online') {
    return { label: 'Online', icon: 'Video', bg: '$blue50', border: '$blue200', color: '$blue600' };
  }
  if (deliveryMode === 'hybrid') {
    return { label: 'Hybrid', icon: 'MapPin', bg: '$purple50', border: '$purple200', color: '$purple600' };
  }
  return { label: 'Offline', icon: 'MapPin', bg: '$observationTaskBg', border: '#fde68a', color: '$warningIconColor' };
};

const getStatusColors = (status: string) => {
  switch (status) {
    case 'Upcoming':
      return { bg: '$blue50', border: '$blue200', text: '$blue600', icon: 'Clock' };
    case 'Accepted':
      return { bg: '$success50', border: '#a7f3d0', text: '$success600', icon: 'CheckCircle' };
    case 'Pending':
      return { bg: '$observationTaskBg', border: '#fde68a', text: '$warningIconColor', icon: 'AlertCircle' };
    case 'Cancelled':
      return { bg: '$error50', border: '$red200', text: '$red600', icon: 'XCircle' };
    case 'Rejected':
    default:
      return { bg: '$error50', border: 'transparent', text: '$error600', icon: 'XCircle' };
  }
};

const Card: React.FC<CardProps> = ({ item: initialItem, provinces, sites }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const navigation = useNavigation();

  const [item, setItem] = useState<AssetItem>(initialItem);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const statusColors = getStatusColors(item.status);
  const isUpcoming = item.status === 'Upcoming';

  const deliveryMode = getDeliveryMode(item);
  const deliveryBadge = getDeliveryBadge(deliveryMode);

  const provinceName = provinces?.find((e: any) => e._id === item.province)?.name;
  const siteNames = sites?.filter((e: any) => e._id === item.siteKey)?.map((e: any) => e.name).join(', ');
  const locationValue = item.meeting_info_details?.location || item.meeting_info?.location || provinceName || item.location;

  const requesterOrgName = typeof item.organization === 'object' ? item.organization?.name : item.organization;

  const hasParticipantCounts = item.seats_limit !== undefined && item.seats_remaining !== undefined;
  const claimed = hasParticipantCounts ? (item.seats_limit || 0) - (item.seats_remaining || 0) : undefined;

  const hasTotalFund = item.estimatedValuePerParticipant !== undefined && item.quantity !== undefined;
  const totalFund = hasTotalFund ? (item.estimatedValuePerParticipant || 0) * (item.quantity || 0) : undefined;

  const handleConfirmCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelSession(item.id);
      setItem((prev) => ({ ...prev, status: 'Cancelled' }));
      setIsCancelModalOpen(false);
      showAlert('success', t('supportProvider.supportOfferings.cards.alerts.offeringCancelled', 'Intervention cancelled successfully!'));
    } catch (error) {
      showAlert('error', t('supportProvider.supportOfferings.cards.alerts.cancelFailed', 'Failed to cancel intervention. Please try again.'));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Box {...styles.cardContainer}>
      <VStack {...styles.cardFullVStack}>
        {/* ROW 1 - TITLE & BADGES */}
        <HStack {...styles.headerTopHStack}>
          <HStack {...styles.headerTitleBadgeHStack}>
            <Text {...styles.cardHeaderTitleText}>{item.title}</Text>

            <Badge {...styles.badgeContainer(statusColors.bg, statusColors.border)}>
              <HStack {...styles.badgeContentHStack}>
                <LucideIcon name={statusColors.icon} {...styles.badgeIconProps(statusColors.text)} />
                <BadgeText {...styles.badgeText(statusColors.text)}>{item.status}</BadgeText>
              </HStack>
            </Badge>

            {item.type ? (
              <Badge {...styles.inKindBadgeContainer}>
                <BadgeText {...styles.inKindBadgeText}>{item.type}</BadgeText>
              </Badge>
            ) : null}
          </HStack>

          <Badge {...styles.deliveryBadgeContainer(deliveryBadge.bg, deliveryBadge.border)}>
            <HStack {...styles.badgeContentHStack}>
              <LucideIcon name={deliveryBadge.icon} {...styles.badgeIconProps(deliveryBadge.color)} />
              <BadgeText {...styles.deliveryBadgeText(deliveryBadge.color)}>{deliveryBadge.label}</BadgeText>
            </HStack>
          </Badge>
        </HStack>

        {/* ROW 2 - DESCRIPTION */}
        {item.description ? (
          <Box {...styles.notesBox}>
            <Text {...styles.notesText} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          </Box>
        ) : null}

        {/* ROW 3 - METADATA */}
        <HStack {...styles.headerMetaHStack}>
          {item.sector ? (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="Package" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>{item.sector}</Text>
            </HStack>
          ) : null}

          {item.value ? (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="Banknote" {...styles.cardMetaIconProps} />
              <Text {...styles.cardValueBoldSmText}>{item.value}</Text>
            </HStack>
          ) : null}

          {hasParticipantCounts ? (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="Users" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {`${claimed} / ${item.seats_limit} claimed (${item.seats_remaining} spots left)`}
              </Text>
            </HStack>
          ) : item.requests ? (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="Users" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>{item.requests}</Text>
            </HStack>
          ) : null}

          {hasTotalFund ? (
            <Badge {...styles.badgeContainer('$success50', '#a7f3d0')}>
              <BadgeText {...styles.badgeText('$success600')}>
                {`Total Fund: R ${totalFund} (${item.quantity} qty)`}
              </BadgeText>
            </Badge>
          ) : null}

          {locationValue ? (
            <HStack {...styles.trainingMetaItemHStack}>
              <LucideIcon name="MapPin" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {locationValue}{siteNames ? ` • ${siteNames}` : ''}
              </Text>
            </HStack>
          ) : null}
        </HStack>

        {/* ROW 4 - ACTIONS */}
        <HStack {...styles.requestedByRowHStack}>
          {item.mentor_name ? (
            <Text {...styles.cardRequestedByText}>
              {t('supportProvider.supportOfferings.cards.requestedByPrefix', 'Requested by: ')}
              <Text fontWeight="$normal" color="$textPrimary" fontSize={'$xs'}>
                {item.mentor_name}
              </Text>
              {requesterOrgName ? ` (${requesterOrgName})` : ''}
            </Text>
          ) : null}

          <HStack {...styles.badgeContentHStack}>
            {isUpcoming && (
              <Button
                // @ts-ignore
                variant="outlineghost" {...styles.cancelActionBtn}
                onPress={() => setIsCancelModalOpen(true)}
              >
                <ButtonIcon as={LucideIcon} name="X" {...styles.cardCopyIconProps} color={'$red600'} />
                {/* @ts-ignore */}
                <ButtonText {...styles.cancelActionBtnText}>
                  {t('supportProvider.supportOfferings.cards.cancel', 'Cancel')}
                </ButtonText>
              </Button>
            )}

            <Button
              variant="solid" {...styles.detailsBtn}
              onPress={() => {
                try {
                  (navigation as any).navigate('requests');
                } catch (e) {
                  showAlert('info', t('supportProvider.supportOfferings.cards.alerts.navigatingRequests'));
                }
              }}
            >
              {/* @ts-ignore */}
              <ButtonText {...styles.detailsBtnText}>
                {t('supportProvider.supportOfferings.cards.viewRequests')}
              </ButtonText>
            </Button>
          </HStack>
        </HStack>
      </VStack>

      <CancelInterventionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={item.title}
        statusLabel={item.status}
        participantsInfo={
          hasParticipantCounts
            ? `${claimed} ${t('supportProvider.supportOfferings.cancelModal.assignedParticipants', 'assigned participants')}`
            : undefined
        }
        supportTypeLabel={t('supportProvider.supportOfferings.cancelModal.assetType', 'Asset')}
        location={locationValue}
        isSubmitting={isCancelling}
        onConfirmCancel={handleConfirmCancel}
      />
    </Box>
  );
};

// ---------- ListCard ----------

interface AssetCardProps {
  items: AssetItem[];
  isShowLoadMore: boolean;
  onLoadMoreItems: () => void;
  isLoadingMore?: boolean;
  _card?: any;
}

export default function AssetCard({
  items = [],
  isShowLoadMore,
  onLoadMoreItems,
  isLoadingMore = false,
  _card,
}: AssetCardProps): React.ReactElement {
  const { t } = useLanguage();

  return (
    <VStack {...styles.listContainer}>
      {items.map((item) => (
        <Card key={item.id} {..._card} item={item} />
      ))}
      {isShowLoadMore && (
        <Box alignItems="center" mt="$4" width="100%">
          <Button onPress={onLoadMoreItems} disabled={isLoadingMore}>
            {isLoadingMore && <ButtonSpinner mr="$2" color="$white" />}
            <ButtonText>{t('common.loadMore', 'Load More')}</ButtonText>
          </Button>
        </Box>
      )}
    </VStack>
  );
}
