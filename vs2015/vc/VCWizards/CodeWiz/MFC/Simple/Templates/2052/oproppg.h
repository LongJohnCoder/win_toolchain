#pragma once

#ifdef _WIN32_WCE
#error "Windows CE ��֧�� COlePropertyPage��"
#endif 

// [!output CLASS_NAME] : ����ҳ�Ի���

class [!output CLASS_NAME] : public COlePropertyPage
{
	DECLARE_DYNCREATE([!output CLASS_NAME])
	DECLARE_OLECREATE_EX([!output CLASS_NAME])

// ���캯��
public:
	[!output CLASS_NAME]();

// �Ի�������
#ifdef AFX_DESIGN_TIME
	enum { IDD = [!output IDD_DIALOG] };
#endif

// ʵ��
protected:
	virtual void DoDataExchange(CDataExchange* pDX);        // DDX/DDV ֧��

// ��Ϣӳ��
protected:
	DECLARE_MESSAGE_MAP()
};
