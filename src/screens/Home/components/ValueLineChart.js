// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2021 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import * as React from 'react';
import { VictoryChart, VictoryLine } from 'victory-native';
import styled from 'styled-components/native';
import { useTranslationWithPrefix } from 'translations/translate';

// Controls
import ValueOverTimeGraph from 'components/modern/ValueOverTimeGraph';

// Utils
import { useThemeColors } from 'utils/themes';

// Types
import type { ViewStyleProp } from 'utils/types/react-native';

// Local
import SmallButton from './SmallButton';

import priceChartData from '../mockData.json';

type Props = {|
  style?: ViewStyleProp;
|};

function ValueLineChart({ style }: Props) {
  const { t } = useTranslationWithPrefix('home.charts.value');

  const [activeInterval, setActiveInterval] = React.useState<?number>(7);

  const chartData = usePriceChartData();

  const colors = useThemeColors();

  const intervals = [
    { value: 7, title: t('7days') },
    { value: 30, title: t('30days') },
    { value: 182, title: t('6months') },
    { value: 365, title: t('1year') },
    { value: null, title: t('all') },
  ];

  return (
    <Container>
      <ValueOverTimeGraph data={chartData} />
    </Container>
  );
}

export default ValueLineChart;

export type DataPoint = {|
  date: Date,
  value: number,
|};

export function usePriceChartData(): DataPoint[] {
  const dataPoints = priceChartData.map(point => ({
    date: new Date(point.timestamp),
    value: point.balance,
  }));

  console.log("AAA", dataPoints);

  return dataPoints;
}

const styles = {
  chart: {
    height: 300,
  },
};

const Container = styled.View`
  justify-content: flex-end;
  align-items: stretch;
  height: 340px;
`;

const IntervalContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

