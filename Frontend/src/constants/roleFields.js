export const ROLE_SPECIFIC_FIELDS = {
  fisherman: [
    {
      name: 'roleSpecificInfo.fishingLicenseNo',
      label: 'Fishing License Number',
      type: 'text',
      required: true,
      placeholder: 'Enter your fishing license number'
    },
    {
      name: 'roleSpecificInfo.localArea',
      label: 'Fishing Area',
      type: 'text',
      required: true,
      placeholder: 'Enter your primary fishing area'
    },
    {
      name: 'roleSpecificInfo.yearsOfExperience',
      label: 'Years of Experience',
      type: 'number',
      required: true,
      placeholder: 'Years of fishing experience'
    }
  ],
  
  coastal_resident: [
    {
      name: 'roleSpecificInfo.localArea',
      label: 'Residential Area',
      type: 'text',
      required: true,
      placeholder: 'Enter your residential area near mangroves'
    },
    {
      name: 'roleSpecificInfo.yearsOfExperience',
      label: 'Years in the Area',
      type: 'number',
      required: true,
      placeholder: 'How long have you lived here?'
    }
  ],

  ngo_admin: [
    {
      name: 'roleSpecificInfo.organizationName',
      label: 'Organization Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your organization name'
    },
    {
      name: 'roleSpecificInfo.expertise',
      label: 'Areas of Expertise',
      type: 'multiSelect',
      required: true,
      options: [
        'Mangrove Conservation',
        'Community Engagement',
        'Environmental Education',
        'Marine Biology',
        'Coastal Management'
      ]
    }
  ],

  government_officer: [
    {
      name: 'roleSpecificInfo.governmentId',
      label: 'Government ID',
      type: 'text',
      required: true,
      placeholder: 'Enter your government ID'
    },
    {
      name: 'roleSpecificInfo.department',
      label: 'Department',
      type: 'text',
      required: true,
      placeholder: 'Enter your department'
    }
  ],

  researcher: [
    {
      name: 'roleSpecificInfo.researchInstitution',
      label: 'Research Institution',
      type: 'text',
      required: true,
      placeholder: 'Enter your research institution'
    },
    {
      name: 'roleSpecificInfo.expertise',
      label: 'Research Areas',
      type: 'multiSelect',
      required: true,
      options: [
        'Mangrove Ecology',
        'Marine Biology',
        'Environmental Science',
        'Climate Change',
        'Biodiversity',
        'Remote Sensing'
      ]
    }
  ],

  local_guide: [
    {
      name: 'roleSpecificInfo.localArea',
      label: 'Area of Operation',
      type: 'text',
      required: true,
      placeholder: 'Enter your area of operation'
    },
    {
      name: 'roleSpecificInfo.yearsOfExperience',
      label: 'Years of Experience',
      type: 'number',
      required: true,
      placeholder: 'Years of experience as local guide'
    },
    {
      name: 'roleSpecificInfo.expertise',
      label: 'Areas of Expertise',
      type: 'multiSelect',
      required: true,
      options: [
        'Mangrove Trails',
        'Local Flora',
        'Local Fauna',
        'Traditional Knowledge',
        'Conservation Practices'
      ]
    }
  ],

  citizen_scientist: [
    {
      name: 'roleSpecificInfo.expertise',
      label: 'Areas of Interest',
      type: 'multiSelect',
      required: true,
      options: [
        'Wildlife Monitoring',
        'Plant Identification',
        'Water Quality',
        'Coastal Ecology',
        'Community Science'
      ]
    },
    {
      name: 'roleSpecificInfo.yearsOfExperience',
      label: 'Years of Experience',
      type: 'number',
      required: false,
      placeholder: 'Years of experience in citizen science'
    }
  ]
};
