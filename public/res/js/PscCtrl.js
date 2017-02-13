/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('PscCtrl', function ($http, toastService) {


    const pscPath = 'http://own-server.url:8001/psc-server.url';

    var psc = this;

    var pscHeaders = {
      'Authorization': 'Basic <auth-key>',
      'SOAPAction': 'Retrieve',
      'Content-Type': 'text/xml'
    };

    var readIncidentRequestPart1 =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
      'xmlns:pws="http://web-service.url/pws"' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '<pws:RetrieveIncidentRequest ignoreEmptyElements="true">' +
      '<pws:model>' +
      '<pws:keys>' +
      '<pws:IncidentID type="String">';
    var readIncidentRequestPart2 =
      '</pws:IncidentID>' +
      '</pws:keys>' +
      '<pws:instance />' +
      '</pws:model>' +
      '</pws:RetrieveIncidentRequest>' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>';

    var readChangeRequestPart1 =
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
      'xmlns:pws="http://web-service.url/pws"' +
      '<soapenv:Header/> <soapenv:Body> <pws:RetrieveDBSChangeRequest ignoreEmptyElements="true"> <pws:model> ' +
      '<pws:keys> <pws:ChangeNummer type="String">';
    var readChangeRequestPart2 =
      '</pws:ChangeNummer> </pws:keys> <pws:instance/> ' +
      '</pws:model> </pws:RetrieveDBSChangeRequest> </soapenv:Body> </soapenv:Envelope>';

    psc.data = {
      incident: {
        'incidentId': '',
        'category': '',
        'subcategory': '',
        'productType': '',
        'openTime': '',
        'updatedTime': '',
        'openedBy': '',
        'location': '',
        'contact': '',
        'ticketOwner': '',
        'company': '',
        'ticketStatus': '',
        'journalUpdates': ''
      },
      change: {
        'changeId': '',
        'category': '',
        'status': '',
        'initiated': '',
        'coordinator': '',
        'phase': '',
        'risk': '',
        'priority': '',
        'customer': '',
        'date': '',
        'cause': '',
        'environment': '',
        'group': ''
      }
    };

    // example: IM32858665
    psc.readIncident = function (incidentId) {
      $http.post(pscPath,
        readIncidentRequestPart1 + incidentId + readIncidentRequestPart2, pscHeaders)
        .then(function successCallback(response) {
          var xml = $.parseXML(response.data);
          var $xml = $(xml);
          psc.data.incident.incidentId = $xml.find('IncidentID')[0].innerHTML;
          psc.data.incident.category = $xml.find('Category').text();
          psc.data.incident.subcategory = $xml.find('Subcategory').text();
          psc.data.incident.productType = $xml.find('ProductType').text();
          psc.data.incident.openTime = $xml.find('OpenTime').text();
          psc.data.incident.updatedTime = $xml.find('UpdatedTime').text();
          psc.data.incident.openedBy = $xml.find('OpenedBy').text();
          psc.data.incident.location = $xml.find('Location').text();
          psc.data.incident.contact = $xml.find('Contact').text();
          psc.data.incident.ticketOwner = $xml.find('TicketOwner').text();
          psc.data.incident.company = $xml.find('Company').text();
          psc.data.incident.ticketStatus = $xml.find('IMTicketStatus').text();
          var journal = $xml.find('JournalUpdates');
          var journalString = '';
          for (var i = 1; i < journal.length; i++) {
            journalString += journal[i].textContent + '<br>';
          }
          psc.data.incident.journalUpdates = journalString;
        }, function errorCallback(response) {
          console.log(response.data);
          toastService.showErrorToast('Fehler beim Abrufen der Daten von PSC. Details in der Konsole.');
        });
    };

    // example: C30507701
    psc.readChange = function (changeId) {
      $http.post(pscPath,
        readChangeRequestPart1 + changeId + readChangeRequestPart2, pscHeaders)
        .then(function successCallback(response) {
          var xml = $.parseXML(response.data);
          var $xml = $(xml);
          psc.data.change.changeId = $xml.find('ChangeNummer')[0].innerHTML;
          psc.data.change.category = $xml.find('ChangeKategorie').text();
          psc.data.change.status = $xml.find('Status').text();
          psc.data.change.initiated = $xml.find('InitiiertVon').text();
          psc.data.change.coordinator = $xml.find('Koordinator').text();
          psc.data.change.phase = $xml.find('CurrentPhase').text();
          psc.data.change.risk = $xml.find('RiskAssessment').text();
          psc.data.change.priority = $xml.find('Prioritaet').text();
          psc.data.change.customer = $xml.find('Mandant').text();
          psc.data.change.date = $xml.find('DbsTargetDate').text();
          psc.data.change.cause = $xml.find('DbsCauseProcedure').text();
          psc.data.change.environment = $xml.find('DbsEnvironment').text();
          psc.data.change.group = $xml.find('AusloesendeOE').text();
        }, function errorCallback(response) {
          console.log(response.data);
          toastService.showErrorToast('Fehler beim Abrufen der Daten von PSC. Details in der Konsole.');
        });
    };

  });