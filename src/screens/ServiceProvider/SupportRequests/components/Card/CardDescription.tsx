import React from 'react';
import { Text } from '@gluestack-ui/themed';
import cardStyles from '../../styles';

// Description the LC wrote on the request, shown on the SP request card
export default function CardDescription({ description }: { description?: string }) {
  if (!description?.trim()) return null;
  return (
    <Text {...cardStyles.cardDescriptionText} numberOfLines={3}>
      {description.trim()}
    </Text>
  );
}
