import React, { Component } from 'react';

import { Block } from 'galio-framework';

import ServiceBlock from './serviceBlock';

import { connect } from 'react-redux';

class ServiceBlockContainer extends Component {
  constructor() {
    super();
    this.state = {
      selected_service_id: null
    }
    this.updateSelectedService = this.updateSelectedService.bind(this);
  }

  updateSelectedService(serviceid) {
    if(this.state.selected_service_id !== serviceid){
      this.setState({ selected_service_id: serviceid });
    } else {
      this.setState({ selected_service_id: null });
    }
  }

  render() {
    let that = this
    const { categoryId, businessLocationId, handleServiceToggle, nextPage } = this.props;
    let businessLocationServiceIds = this.props.serviceBusinessLocationMap.filter(x => x.business_location_id === businessLocationId).map(x => x.service_business_id);
    return (
      <Block>
        {this.props.service.filter(x => businessLocationServiceIds.includes(x.service_id) && x.service_business_category_id === categoryId).map(function(serviceObj){
            return (
              <ServiceBlock
                key={'service' + serviceObj.service_id}
                serviceData={serviceObj}
                nextPage={nextPage}
                selectedService={that.state.selected_service_id}
                updateSelectedService={that.updateSelectedService}
                businessLocationId={businessLocationId}
                handleServiceToggle={handleServiceToggle}
              />
            );
        })}
      </Block>
    )
  }

}

function mapStateToProps(state, ownProps) {
  return {
    service: state.service,
    serviceBusinessLocationMap: state.serviceBusinessLocationMap
  }
}

export default connect(mapStateToProps,)(ServiceBlockContainer);