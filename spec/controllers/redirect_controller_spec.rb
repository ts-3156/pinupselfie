require 'rails_helper'

RSpec.describe RedirectController, :type => :controller do

  describe 'GET to' do
    context 'when params[:url] is empty' do
      it 'returns http success' do
        get :to
        expect(response).to have_http_status(:success)
        expect(response.body).to eq('error')
      end
    end

    context 'when params[:url] is present' do
      context 'when params[:url] is not twitter.com' do
        let(:url) { 'http://example.com' }
        it 'returns http success' do
          get :to, url: url
          expect(response).to have_http_status(:success)
          expect(response.body).to eq('error')
        end
      end

      context 'when params[:url] starts with http://twitter.com' do
        let(:url) { 'http://twitter.com' }
        it 'redirects to params[:url]' do
          get :to, url: url
          expect(response).to redirect_to(url)
        end
      end

      context 'when params[:url] starts with https://twitter.com' do
        let(:url) { 'https://twitter.com' }
        it 'redirects to params[:url]' do
          get :to, url: url
          expect(response).to redirect_to(url)
        end
      end
    end
  end
end
