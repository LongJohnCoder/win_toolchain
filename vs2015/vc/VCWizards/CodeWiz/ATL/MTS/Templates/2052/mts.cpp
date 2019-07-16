// [!output IMPL_FILE] : [!output CLASS_NAME] ��ʵ��

#include "stdafx.h"
#include "[!output HEADER_FILE]"


// [!output CLASS_NAME]

[!if OBJECT_CONTROL]
HRESULT [!output CLASS_NAME]::Activate()
{
	HRESULT hr = GetObjectContext(&m_spObjectContext);
	if (SUCCEEDED(hr))
		return S_OK;
	return hr;
} 

BOOL [!output CLASS_NAME]::CanBePooled()
{
	return FALSE;
} 

void [!output CLASS_NAME]::Deactivate()
{
	m_spObjectContext.Release();
} 

[!endif]