#pragma once

using namespace System;
using namespace System::ComponentModel;
using namespace System::Collections;
using namespace System::Windows::Forms;
using namespace System::Data;
using namespace System::Drawing;


[!output SAFE_NAMESPACE_BEGIN]
	/// <summary>
	/// [!output SAFE_ITEM_NAME] ժҪ
	/// </summary>
	public ref class [!output SAFE_ITEM_NAME] : public System::Windows::Forms::UserControl
	{
	public:
		[!output SAFE_ITEM_NAME](void)
		{
			InitializeComponent();
			//
			//TODO:  �ڴ˴���ӹ��캯������
			//
		}

	protected:
		/// <summary>
		/// ������������ʹ�õ���Դ��
		/// </summary>
		~[!output SAFE_ITEM_NAME]()
		{
			if (components)
			{
				delete components;
			}
		}

	private:
		/// <summary>
		/// ����������������
		/// </summary>
		System::ComponentModel::Container ^components;

#pragma region Windows Form Designer generated code
		/// <summary>
		/// �����֧������ķ��� - ��Ҫ�޸�
		/// ʹ�ô���༭���޸Ĵ˷��������ݡ�
		/// </summary>
		void InitializeComponent(void)
		{
			this->AutoScaleMode = System::Windows::Forms::AutoScaleMode::Font;
		}
#pragma endregion
	};
[!output SAFE_NAMESPACE_END]
