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
import { View, LayoutAnimation } from 'react-native';
import PagerView from 'react-native-pager-view';
import styled from 'styled-components/native';
import { BigNumber } from 'bignumber.js';
import { clamp } from 'lodash';

// Components
import PagerControl from 'components/modern/PagerControl';

// Utils
import { SCALE_XY } from 'utils/layoutAnimations';
import { spacing } from 'utils/variables';

// Types
import type { ChainRecord } from 'models/Chain';
import type { CategoryRecord } from 'models/TotalBalances';

// Local
import IconButton from './components/IconButton';
import AssetPieChart from './components/AssetPieChart';
import ChainPieChart from './components/ChainPieChart';
import ValueLineChart from './components/ValueLineChart';

type Props = {|
  balancePerCategory: CategoryRecord<BigNumber>,
  balancePerChain: ChainRecord<BigNumber>,
|};

function ChartsSection({ balancePerCategory, balancePerChain }: Props) {
  const pagerRef = React.useRef<any>();

  const [currentPage, setCurrentPage] = React.useState(0);
  const [showPriceChart, setShowPriceChart] = React.useState(false);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
    pagerRef.current.setPage(page);
  };

  const handlePageScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.position + event.nativeEvent.offset);
    setCurrentPage(clamp(page, 0, 1));
  };

  const togglePriceChart = () => {
    LayoutAnimation.configureNext(SCALE_XY);
    setShowPriceChart(!showPriceChart);
  };

  return (
    <Container>
      {!showPriceChart && (
        <PieChartView>
          <PagerView ref={pagerRef} onPageScroll={handlePageScroll} style={styles.pageView}>
            <View key="assets" collapsable={false}>
              <AssetPieChart balancePerCategory={balancePerCategory} />
            </View>
            <View key="chains" collapsable={false}>
              <ChainPieChart balancePerChain={balancePerChain} />
            </View>
          </PagerView>
          <PagerControl
            pageCount={2}
            currentPage={currentPage}
            onChangePage={handleChangePage}
          />
        </PieChartView>
      )}
      {showPriceChart && <ValueLineChart />}

      <ControlsContainer>
        <IconButton iconName={showPriceChart ? 'line-chart' : 'pie-chart'} onPress={() => togglePriceChart()} />
      </ControlsContainer>
    </Container>
  );
}

export default ChartsSection;

const styles = {
  pageView: {
    height: 300,
  },
};

const Container = styled.View``;

const PieChartView = styled.View``;

const ControlsContainer = styled.View`
  position: absolute;
  left: ${spacing.medium}px;
  bottom: 0;
`;
