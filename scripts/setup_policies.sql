-- RLS Policies for HomePanel

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Cases policies
CREATE POLICY "Clients can view own cases" ON public.cases FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can insert own cases" ON public.cases FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Admins can view all cases" ON public.cases FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all cases" ON public.cases FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Onboarding progress policies
CREATE POLICY "Clients can view own onboarding" ON public.onboarding_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "Clients can update own onboarding" ON public.onboarding_progress FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "Admins can view all onboarding" ON public.onboarding_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all onboarding" ON public.onboarding_progress FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Documents policies
CREATE POLICY "Clients can view own documents" ON public.documents FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "Clients can upload documents" ON public.documents FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "Admins can manage all documents" ON public.documents FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Messages policies
CREATE POLICY "Users can view messages for their cases" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND (client_id = auth.uid() OR assigned_solicitor_id = auth.uid())));
CREATE POLICY "Users can send messages for their cases" ON public.messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND (client_id = auth.uid() OR assigned_solicitor_id = auth.uid())));
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Activity log policies
CREATE POLICY "Clients can view own activity" ON public.activity_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "Admins can view all activity" ON public.activity_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can insert activity" ON public.activity_log FOR INSERT WITH CHECK (true);
