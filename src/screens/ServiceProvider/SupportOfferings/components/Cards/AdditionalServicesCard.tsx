import React from 'react';
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
import type { ServiceItem } from '../../../../../types/supportOfferingsTypes';
import { FORM_MODE, SESSION_STATUS, SESSION_STATUS_LABEL } from '@constants/SUPPORT_PROVIDER_CARDS';
import styles from '../../styles';

// ---------- Card ----------

interface CardProps {
  item: ServiceItem;
  provinces?: any[];
  sites?: any[];
}

const Card: React.FC<CardProps> = ({ item, provinces, sites }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const navigation = useNavigation();

  const getStatusColors = (status: string) => {
    switch (status) {
      case SESSION_STATUS_LABEL.DRAFT:
        return { bg: '$backgroundLight100', border: 'transparent', text: '$textMuted', icon: 'FileText' };
      case SESSION_STATUS_LABEL.UPCOMING:
        return { bg: '$blue50', border: 'transparent', text: '$blue600', icon: 'Clock' };
      case SESSION_STATUS_LABEL.IN_PROGRESS:
        return { bg: '$observationTaskBg', border: 'transparent', text: '$warningIconColor', icon: 'AlertCircle' };
      case SESSION_STATUS_LABEL.COMPLETED:
      default:
        return { bg: '$success50', border: 'transparent', text: '$success600', icon: 'CheckCircle' };
    }
  };

  // Normalize raw backend status (DRAFT / PUBLISHED / LIVE / COMPLETED) into a display label
  const formatStatus = () => {
    const rawStatus = (item as any)?.status || '';
    const thisStatus = String(rawStatus).toUpperCase();

    if (thisStatus === SESSION_STATUS.DRAFT) {
      return SESSION_STATUS_LABEL.DRAFT;
    }
    if (thisStatus === SESSION_STATUS.COMPLETED) {
      return SESSION_STATUS_LABEL.COMPLETED;
    }

    const startDate = (item as any)?.start_date;
    const endDate = (item as any)?.end_date;
    if (startDate) {
      const startMs =
        typeof startDate === 'number' || !isNaN(Number(startDate))
          ? Number(startDate) * 1000
          : new Date(startDate).getTime();
      const endMs = endDate
        ? (typeof endDate === 'number' || !isNaN(Number(endDate))
          ? Number(endDate) * 1000
          : new Date(endDate).getTime())
        : undefined;
      const nowMs = Date.now();

      if (endMs !== undefined && nowMs > endMs) {
        return SESSION_STATUS_LABEL.COMPLETED;
      }
      if (nowMs < startMs) {
        return SESSION_STATUS_LABEL.UPCOMING;
      }
      return SESSION_STATUS_LABEL.IN_PROGRESS;
    }

    return rawStatus || SESSION_STATUS_LABEL.UPCOMING;
  };

  const statusTag = formatStatus();
  const statusColors = getStatusColors(statusTag);
  const isDraft = statusTag === SESSION_STATUS_LABEL.DRAFT;
  const isUpcoming = statusTag === SESSION_STATUS_LABEL.UPCOMING;

  // Province / site names resolved from the option lists passed down from the parent screen
  const provinceName = provinces?.find(
    (e: any) => e._id === (item as any)?.provinces?.[0] || e._id === (item as any)?.meta?.provinces?.[0]
  )?.name;

  const siteNames = sites?.filter(
    (e: any) => (item as any)?.sites?.includes(e._id) || (item as any)?.meta?.sites?.includes(e._id)
  )?.map((e: any) => e.name).join(', ');

  const requestsCount =
    (item as any)?.requests ??
    (item as any)?.seats_limit ??
    (item as any)?.meta?.requests ??
    undefined;

  const requesterName = (item as any)?.mentor_name || (item as any)?.meta?.mentor_name;
  const requesterOrg = (item as any)?.organization || (item as any)?.meta?.organization;
  const requesterOrgName = typeof requesterOrg === 'object' ? requesterOrg?.name : requesterOrg;

  return (
    <Box {...styles.cardContainer}>
      <HStack {...styles.cardHeaderHStack}>
        {/* Left Side: Info */}
        <VStack {...styles.cardLeftVStack}>
          {/* Row 1: Title + Badge */}
          <HStack {...styles.titleRowHStack}>
            <Text {...styles.cardTitleText}>
              {item.title}
            </Text>
            <Badge {...styles.badgeContainer(statusColors.bg)}>
              <HStack {...styles.badgeContentHStack}>
                <LucideIcon name={statusColors.icon} {...styles.badgeIconProps(statusColors.text)} />
                <BadgeText {...styles.badgeText(statusColors.text)}>
                  {statusTag}
                </BadgeText>
              </HStack>
            </Badge>
          </HStack>

          {/* Row 2: Description */}
          {item.description ? (
            <Text {...styles.cardDescriptionText}>
              {item.description}
            </Text>
          ) : null}

          {/* Row 3: Metadata */}
          <HStack {...styles.metaRowHStack}>
            <HStack {...styles.metaItemHStack}>
              <LucideIcon name="MapPin" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {provinceName || item.location || '-'}{siteNames ? ` • ${siteNames}` : (item.hubOffice ? ` • ${item.hubOffice}` : '')}
              </Text>
            </HStack>

            {item.site ? (
              <HStack {...styles.metaItemHStack}>
                <LucideIcon name="Building2" {...styles.cardMetaIconProps} />
                <Text {...styles.cardMetaSmText}>
                  {item.site}
                </Text>
              </HStack>
            ) : null}

            <HStack {...styles.metaItemHStack}>
              <LucideIcon name="Users" {...styles.cardMetaIconProps} />
              <Text {...styles.cardMetaSmText}>
                {requestsCount !== undefined
                  ? t('supportProvider.supportOfferings.cards.requestsCount', '{{count}} requests / spots', { count: requestsCount })
                  : '-'}
              </Text>
            </HStack>
          </HStack>

          {/* Row 4: Requested by */}
          {requesterName ? (
            <Text {...styles.cardRequestedByText}>
              {t('supportProvider.supportOfferings.cards.requestedByPrefix', 'Requested by: ')}
              <Text fontWeight="$normal" color="$textPrimary" fontSize={'$xs'}>
                {requesterName}
              </Text>
              {requesterOrgName ? ` (${requesterOrgName})` : ''}
            </Text>
          ) : null}
        </VStack>

        {/* Right Side: Action Buttons */}
        <HStack {...styles.cardRightActionStack}>
          {/* UPCOMING: Cancel */}
          {isUpcoming && (
            <Button
              // @ts-ignore
              variant="outlineghost" {...styles.cancelActionBtn}
              onPress={() => showAlert('success', t('supportProvider.supportOfferings.cards.alerts.offeringCancelled', 'Intervention cancelled successfully!'))}
            >
              <ButtonIcon as={LucideIcon} name="X" {...styles.cardCopyIconProps} color={'$red600'} />
              {/* @ts-ignore */}
              <ButtonText {...styles.cancelActionBtnText}>
                {t('supportProvider.supportOfferings.cards.cancel', 'Cancel')}
              </ButtonText>
            </Button>
          )}

          {/* DRAFT: Edit */}
          {isDraft && (
            <Button
              // @ts-ignore
              variant="outlineghost" {...styles.outlineActionBtn}
              onPress={() => (navigation as any).navigate('create-additional-service', { id: item.id, type: FORM_MODE.EDIT })}
            >
              <ButtonIcon as={LucideIcon} name="Pencil" {...styles.cardCopyIconProps} />
              {/* @ts-ignore */}
              <ButtonText {...styles.outlineActionBtnText}>
                {t('common.edit', 'Edit')}
              </ButtonText>
            </Button>
          )}

          {/* UPCOMING / IN PROGRESS / COMPLETED: Copy Intervention */}
          {!isDraft && (
            <Button
              variant="outline" {...styles.outlineActionBtn}
              onPress={() => (navigation as any).navigate('create-additional-service', { id: item.id, type: FORM_MODE.COPY })}
            >
              <ButtonIcon as={LucideIcon} name="Copy" {...styles.cardCopyIconProps} />
              {/* @ts-ignore */}
              <ButtonText {...styles.outlineActionBtnText}>
                {t('supportProvider.supportOfferings.cards.copyIntervention', 'Copy Intervention')}
              </ButtonText>
            </Button>
          )}

          {/* ALL STATUSES: View Requests */}
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
    </Box>
  );
};

// ---------- ListCard ----------

interface AdditionalServicesCardProps {
  items: ServiceItem[];
  isShowLoadMore: boolean;
  onLoadMoreItems: () => void;
  isLoadingMore?: boolean;
  _card?: any;
}

export default function AdditionalServicesCard({
  items = [],
  isShowLoadMore,
  onLoadMoreItems,
  isLoadingMore = false,
  _card,
}: AdditionalServicesCardProps): React.ReactElement {
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
