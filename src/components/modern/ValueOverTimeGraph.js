// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

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
import React, { useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { subWeeks, subMonths, subYears, subDays, isBefore, format } from 'date-fns';
import t from 'translations/translate';

// Components
import Graph from 'components/Graph';
import { Spacing } from 'components/Layout';
import SmallButton from 'screens/Home/components/SmallButton';

// Selectors
import { useFiatCurrency } from 'selectors';

// Utils
import { formatFiat, getDeviceWidth } from 'utils/common';
import { spacing } from 'utils/variables';

type DataPoint = {
  date: Date,
  value: number, // in current fiat currency
  hideTooltip?: boolean,
};

type Props = {
  data: DataPoint[],
  fiatCurrency: string,
  onGestureStart?: () => void,
  onGestureEnd?: () => void,
};

const screenWidth = getDeviceWidth();

const MONTH = 'MONTH';
const WEEK = 'WEEK';
const HALF_YEAR = 'HALF_YEAR';
const YEAR = 'YEAR';
const ALL = 'ALL';

const ValueOverTimeGraph = ({
  data,
}: Props) => {
  const [activeTimeRange, setActiveTimeRange] = useState(WEEK);

  const fiatCurrency = useFiatCurrency();

  const timeRangeEnd = data[data.length - 1].date;

  const timeRanges = {
    [WEEK]: {
      label: t('graph.timeRangeButtons.week'),
      getTimeRangeStart: () => subWeeks(timeRangeEnd, 1),
      tooltipDateFormat: 'D MMM',
    },
    [MONTH]: {
      label: t('graph.timeRangeButtons.month'),
      getTimeRangeStart: () => subDays(timeRangeEnd, 30),
      tooltipDateFormat: 'D MMM',
    },
    [HALF_YEAR]: {
      label: t('graph.timeRangeButtons.halfYear'),
      getTimeRangeStart: () => subMonths(timeRangeEnd, 6),
      tooltipDateFormat: 'D MMM',
    },
    [YEAR]: {
      label: t('graph.timeRangeButtons.year'),
      getTimeRangeStart: () => subYears(timeRangeEnd, 1),
      tooltipDateFormat: 'D MMM',
    },
    tenYear: {
      label: '5Y',
      getTimeRangeStart: () => subYears(timeRangeEnd, 5),
      tooltipDateFormat: 'D MMM',
    },
    [ALL]: {
      label: t('graph.timeRangeButtons.all'),
      getTimeRangeStart: () => data[0].date,
      tooltipDateFormat: 'D MMM YYYY',
    },
  };

  const timeRangeStart = timeRanges[activeTimeRange].getTimeRangeStart();

  const filteredData = prepareData(data, timeRangeStart);

  const values = filteredData.map((p) => p.value);
  let maxY = Math.max(...values);
  const minY = Math.min(...values);
  if (maxY === minY) maxY = minY + 1;
  const maxX = timeRangeEnd;
  const minX = timeRangeStart.getTime();

  const processedData = filteredData.map(({ value, date }) => ({
    x: (date.getTime() - minX) / (maxX - minX),
    y: (value - minY) / (maxY - minY),
  }));

  const getTooltipContents = (activeDataPoint: number) => {
    const { date, value, hideTooltip } = filteredData[activeDataPoint];
    if (hideTooltip) return undefined;

    // eslint-disable-next-line i18next/no-literal-string
    return `${format(date, timeRanges[activeTimeRange].tooltipDateFormat)}\n${formatFiat(value, fiatCurrency)}`;
  };

  return (
    <View>
      <Graph
        width={screenWidth}
        height={200}
        data={processedData}
        getTooltipContents={getTooltipContents}
        extra={activeTimeRange}
      />

      <Spacing h={24} />

      <IntervalContainer>
        {Object.keys(timeRanges).map((range) => (
          <SmallButton
            key={range}
            title={timeRanges[range].label}
            onPress={() => setActiveTimeRange(range)}
            active={range === activeTimeRange}
          />
        ))}
      </IntervalContainer>
    </View>
  );
};

export default ValueOverTimeGraph;

const prepareData = (dataPoints: DataPoint[], timeRangeStart: Date): DataPoint[] => {
  const matchingDataPoints = dataPoints.filter(point => !isBefore(point.date, timeRangeStart));

  const addStartPoint = isBefore(timeRangeStart, matchingDataPoints[0].date);
  if (addStartPoint) {
    const startPoint = { date: timeRangeStart, value: matchingDataPoints[0].value, hideTooltip: true };
    return [startPoint, ...matchingDataPoints];
  }

  return matchingDataPoints;
};

const IntervalContainer = styled.View`
  padding: 0 ${spacing.large}px;
  flex-direction: row;
  justify-content: space-between;
`;
